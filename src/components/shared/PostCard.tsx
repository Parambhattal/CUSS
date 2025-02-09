import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useState } from "react";
import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { Button, Input } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import { addComment, deleteComment, getCommentsByPostId } from "@/lib/appwrite/api";

type PostCardProps = {
  post: Models.Document;
};

type Comment = {
  $id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

  if (!post.creator) return null;

  const fetchComments = async () => {
    const fetchedComments = await getCommentsByPostId(post.$id);
    if (fetchedComments) setComments(fetchedComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = await addComment(post.$id, user.id, user.name, newComment);
    if (comment) {
      setComments([...comments, comment]);
      setNewComment(""); // Clear the input after posting
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    setComments(comments.filter((c) => c.$id !== commentId));
  };

  return (
    <div className="post-container">
      {/* Post Header */}
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={post.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="creator"
              className="w-12 h-12 lg:h-12 rounded-full"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">{post.creator.name}</p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.$createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">{post.location}</p>
            </div>
          </div>
        </div>

        {/* Edit Post Button (Only for Post Creator) */}
        {user.id === post.creator.$id && (
          <Link to={`/update-post/${post.$id}`}>
            <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
          </Link>
        )}
      </div>

      {/* Post Content */}
      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2">
            {post.tags.map((tag: string, index: number) => (
              <li key={`${tag}-${index}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="post-card_img"
        />
      </Link>

      {/* Post Stats (Likes, Saves, etc.) */}
      <PostStats
        post={post}
        userId={user.id}
        onCommentClick={() => {
          setIsCommentSectionOpen(!isCommentSectionOpen);
          if (!isCommentSectionOpen) fetchComments();
        }}
      />

      {/* Comment Section */}
      <AnimatePresence>
        {isCommentSectionOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mt-4 bg-white rounded-lg shadow-lg border border-slate-200 p-4"
          >
            <h3 className="text-lg font-semibold mb-4">Comments</h3>

            {/* Input Box */}
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="text"
                className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
              />
              <Button onClick={handleAddComment} className="bg-slate-800 text-white hover:bg-slate-700">
                Post
              </Button>
            </div>

            {/* Comment List */}
            <div className="max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.$id}
                  className="flex items-center justify-between p-2 border-b border-slate-100"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-600">{comment.userName}</p>
                    <p className="text-sm text-slate-600">{comment.content}</p>
                  </div>
                  {comment.userId === user.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.$id)}
                      className="hover:bg-slate-100"
                    >
                      <img
                        src="/assets/icons/delete.svg"
                        alt="delete"
                        width={16}
                        height={16}
                      />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard;