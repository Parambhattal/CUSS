import { ID, Query } from "appwrite";
import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";

type Comment = {
  $id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
};

// ============================================================
// AUTH
// ============================================================

// ============================== GET CURRENT USER
export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No account found");

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!response || response.documents.length === 0) {
      throw new Error("User not found in the database");
    }

    return response.documents[0];
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw new Error("Account creation failed.");

    const avatarUrl = avatars.getInitials(user.name)?.toString() || "";

    return await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      uid: user.uid,
      imageUrl: avatarUrl,
      section: user.section,
    });
  } catch (error) {
    console.error("Error creating user account:", error);
    return null;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  uid: string;
  section: string;
}): Promise<any> {
  try {
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );
  } catch (error) {
    console.error("Error saving user to database:", error);
    return null;
  }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string): Promise<boolean> {
  if (!savedRecordId) return false;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    return true;
  } catch (error) {
    console.error("Error deleting saved post:", error);
    return false;
  }
}

// ============================== GET INFINITE POSTS (Pagination Support)
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw new Error("Failed to fetch posts");

    return posts;
  } catch (error) {
    console.error("Error fetching infinite posts:", error);
    return null;
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw new Error("Post ID is required");

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw new Error("Post not found");

    return post;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    return null;
  }
}

// ============================== GET RECENT POSTS (SORTED BY CREATION DATE)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw new Error("Failed to fetch recent posts");

    return posts.documents;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    return [];
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  if (!userId) {
    console.warn("User ID is missing or invalid");
    return null;
  }

  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) {
      console.warn("User not found for ID:", userId);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw new Error("Failed to fetch users");

    return users.documents;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw new Error("Failed to like/unlike post");

    return updatedPost;
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    return null;
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const savedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!savedPost) throw new Error("Failed to save post");

    return savedPost;
  } catch (error) {
    console.error("Error saving post:", error);
    return null;
  }
}

// ============================== SEARCH POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw new Error("No posts found matching the search term");

    return posts.documents;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
}

// ============================== SIGN IN ACCOUNT
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);
    if (!session) throw new Error("Failed to sign in");

    return session;
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
}

// ============================== SIGN OUT ACCOUNT
export async function signOutAccount() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: new URL(post.imageUrl), // Ensure imageUrl is a URL object
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to Appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw new Error("File upload failed.");

      // Get new file URL
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deletePost(uploadedFile.$id);
        throw new Error("Failed to generate file URL.");
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl.toString(), // Convert URL object back to string for storage
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deletePost(image.imageId);
      }

      throw new Error("Failed to update post.");
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deletePost(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.error("Error updating post:", error);
    return null;
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    console.log("Updating user with data:", user);

    let image = {
      imageUrl: user.imageUrl, // Use the existing imageUrl directly
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      console.log("Uploading new file...");

      // Upload new file to Appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) {
        console.error("File upload failed.");
        throw new Error("File upload failed.");
      }

      // Get new file URL
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        console.error("Failed to generate file URL.");
        await deletePost(uploadedFile.$id);
        throw new Error("Failed to generate file URL.");
      }

      image = { ...image, imageUrl: fileUrl.toString(), imageId: uploadedFile.$id };
      console.log("New file uploaded successfully:", image);
    }

    console.log("Updating user document in database...");

    // Update user document in Appwrite database
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl, // Use the updated imageUrl
        imageId: image.imageId, // Use the updated imageId
      }
    );

    if (!updatedUser) {
      console.error("Failed to update user document.");
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deletePost(image.imageId);
      }
      throw new Error("Failed to update user profile.");
    }

    console.log("User document updated successfully:", updatedUser);

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      console.log("Deleting old file...");
      await deletePost(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
}
// ============================== GET USER'S POSTS
export async function getUserPosts(userId: string) {
  if (!userId) throw new Error("User ID is required");

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!posts) throw new Error("Failed to fetch user posts");

    return posts.documents;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}


// ============================================================
// COMMENTS
// ============================================================

// ============================== ADD COMMENT
export async function addComment(postId: string, userId: string, newComment: string, content: string): Promise<Comment | null> {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      {
        postId,
        userId,
        content,
        createdAt: new Date().toISOString(),
      }
    );

    return {
      $id: newComment.$id,
      postId: newComment.postId,
      userId: newComment.userId,
      userName: newComment.userName,
      content: newComment.content,
      createdAt: newComment.createdAt,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return null;
  }
}

// ============================== GET COMMENTS BY POST ID
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal("postId", postId), Query.orderAsc("createdAt")]
    );

    // Fetch user details for each comment
    const commentsWithUser = await Promise.all(
      response.documents.map(async (doc) => {
        const user = await getUserById(doc.userId); // Fetch user details
        return {
          $id: doc.$id,
          postId: doc.postId,
          userId: doc.userId,
          userName: user?.name || "Unknown User", // Assign userName
          content: doc.content,
          createdAt: doc.createdAt,
        };
      })
    );

    return commentsWithUser;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}


// ============================== DELETE COMMENT
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost): Promise<any> {
  try {
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw new Error("File upload failed.");

    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deletePost(uploadedFile.$id);
      throw new Error("Failed to generate file URL.");
    }

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: post.tags?.replace(/ /g, "").split(",") || [],
      }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File): Promise<any> {
  try {
    return await storage.createFile(appwriteConfig.storageId, ID.unique(), file);
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string): URL | null {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (fileUrl) {
      return new URL(fileUrl); // Convert the string to a URL object
    }
    return null;
  } catch (error) {
    console.error("Error generating file preview:", error);
    return null;
  }
}

// ============================== DELETE FILE
export async function deletePost(fileId: string): Promise<boolean> {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}