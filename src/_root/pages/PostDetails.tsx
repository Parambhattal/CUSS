import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { Input } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import { addComment, deleteComment, getCommentsByPostId } from "@/lib/appwrite/api";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queries";

type Comment = {
  $id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
};

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

  const relatedPosts = userPosts?.filter((userPost) => userPost.$id !== id);

  const fetchComments = async () => {
    if (!post?.$id) return; // Ensure post and post.$id are defined
    const fetchedComments = await getCommentsByPostId(post.$id);
    if (fetchedComments) setComments(fetchedComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post?.$id) return; // Ensure post and post.$id are defined

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

  const handleDeletePost = () => {
    if (!post?.$id || !post?.imageId) return; // Ensure post and post.imageId are defined
    deletePost({ postId: post.$id, imageId: post.imageId });
    navigate(-1);
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="post"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id ? "hidden" : ""}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`post_details-delete_btn ${
                    user.id !== post?.creator.$id ? "hidden" : ""
                  }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string, index: number) => (
                  <li
                    key={`${tag}-${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats
                post={post}
                userId={user.id}
                onCommentClick={() => {
                  setIsCommentSectionOpen(!isCommentSectionOpen);
                  if (!isCommentSectionOpen) fetchComments();
                }}
              />
            </div>

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
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;