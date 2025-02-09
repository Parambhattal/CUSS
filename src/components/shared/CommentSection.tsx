import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { addComment, getCommentsByPostId, deleteComment } from "@/lib/appwrite/api";
import { Button, Input } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

type Comment = {
  $id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
};

const CommentSection = ({ postId }: { postId: string }) => {
  const { user } = useUserContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const fetchedComments = await getCommentsByPostId(postId);
      console.log("Fetched Comments:", fetchedComments); // Debugging
      if (fetchedComments) setComments(fetchedComments);
    };

    if (isOpen) fetchComments();
  }, [postId, isOpen]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = await addComment(postId, user.id, user.name, newComment);
    console.log("Added Comment:", comment); // Debugging
    if (comment) {
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    setComments(comments.filter((c) => c.$id !== commentId));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-3 shadow-lg hover:bg-slate-200 transition-colors"
      >
        <img
          src="/assets/icons/comment.svg"
          alt="Comment"
          width={24}
          height={24}
        />
      </Button>

      {/* Comment Section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 right-0 w-96 bg-white rounded-lg shadow-lg border border-slate-200 p-4"
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
        {/* Change text-slate-100 to text-black or another visible color */}
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

export default CommentSection;