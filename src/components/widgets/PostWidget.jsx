import React from "react";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  Divider,
  IconButton,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import Friend from "../UI/Friend";
import WidgetWrapper from "../UI/WidgetWrapper";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "../../store/index";
import EmojiPicker from "emoji-picker-react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import DeleteIcon from "@mui/icons-material/Delete";
import UserImage from "components/UI/UserImage";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/UI/FlexBetween";

const PostWidget = ({
  postId,
  postUserId,
  user,
  name,
  description,
  location,
  postImage,
  userProfilePhoto,
  likes,
  comments,
  showLikes,
  showComments,
  reRender,
  setReRender,
  setFlags,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [comment, setComment] = useState("");
  const [displayComments, setDisplayComments] = useState(comments);
  const [open, setOpen] = useState(false);
  const loggedInUserId = useSelector((state) => state.user._id);
  const [isLiked, setIsLiked] = useState(Boolean(likes[loggedInUserId]));
  const [likeCount, setLikeCount] = useState(Object.keys(likes).length);
  const [displayLike, setDisplayLike] = useState(showLikes);
  const [showDisplayComment, setShowDisplayComment] = useState(showComments);
  const navigate = useNavigate();
  const inputRef = useRef();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);

  const { palette } = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    inputRef.current.focus();
  };

  const patchLike = async () => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    setIsLiked(Boolean(updatedPost.likes[loggedInUserId]));
    setLikeCount(Object.keys(updatedPost.likes).length);
    dispatch(setPost({ post: updatedPost }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/comment`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${user.firstName} ${user.lastName}`,
          image: user.profilePhoto,
          comment,
          userId: user._id,
        }),
      }
    );
    const updatedPost = await response.json();
    setDisplayComments(updatedPost.comments);
    dispatch(setPost({ post: updatedPost }));
    setComment("");
  };

  const deleteComment = async (index) => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/posts/${postId}/comment`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
      }
    );
    const updatedPost = await response.json();
    setDisplayComments(updatedPost.comments);
    dispatch(setPost({ post: updatedPost }));
  };
  
  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userProfilePhoto={userProfilePhoto}
        postId={postId}
        user={user}
        reRender={reRender}
        setReRender={setReRender}
        post={true}
        setFlags={setFlags}
        setShowDisplayComment={setShowDisplayComment}
        showDisplayComment={showDisplayComment}
        setDisplayLike={setDisplayLike}
        displayLike={displayLike}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {postImage && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`${postImage}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          {displayLike && (
            <FlexBetween gap="0.3rem">
              <IconButton onClick={patchLike}>
                {isLiked ? (
                  <FavoriteOutlined sx={{ color: primary }} />
                ) : (
                  <FavoriteBorderOutlined />
                )}
              </IconButton>
              <Typography>{likeCount}</Typography>
            </FlexBetween>
          )}

          {showDisplayComment && (
            <FlexBetween gap="0.3rem">
              <IconButton onClick={() => setIsComments(!isComments)}>
                <ChatBubbleOutlineOutlined />
              </IconButton>
              <Typography>{comments.length}</Typography>
            </FlexBetween>
          )}
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && showComments && (
        <>
          <Box sx={{ mt: "0.5rem", overflowY: "scroll", maxHeight: "7rem" }}>
            {displayComments?.map((comment, index) => (
              <Box key={`${name}-${index}`}>
                <Divider />
                <Typography
                  sx={{
                    color: main,
                    m: "0.5rem 0",
                    pl: "1rem",
                    display: "flex",
                  }}
                >
                  <UserImage image={comment.image} size="40px" />
                  <Typography
                    sx={{ width: isNonMobileScreens ? "77%" : "70%" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        marginLeft: "0.6rem",
                        fontWeight: "bold",
                        "&:hover": {
                          color: palette.primary.light,
                          cursor: "pointer",
                        },
                      }}
                      onClick={() => navigate(`/profile/${comment.userId}`)}
                    >
                      {comment.name}
                    </Typography>
                    <Typography
                      sx={{
                        marginTop: "0rem",
                        marginLeft: "1rem",
                        overflow: "auto",
                      }}
                    >
                      {comment.comment}
                    </Typography>
                  </Typography>
                  {user._id === comment.userId && (
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={() => deleteComment(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
          <form style={{ marginTop: "1.2rem" }} onSubmit={submitHandler}>
            <Button
              variant="outlined"
              onClick={handleOpen}
              sx={{ height: "2.3rem", minWidth: "10%", padding: 0 }}
            >
              <EmojiEmotionsIcon />
            </Button>
            <Dialog
              open={open}
              onClose={handleClose}
              sx={{ top: 0, left: 0, position: "fixed" }}
            >
              <EmojiPicker
                onEmojiClick={(e) => {
                  setComment(`${comment} ${e.emoji}`);
                  handleClose();
                }}
                height="350px"
              />
            </Dialog>
            <TextField
              label="Add your comment here"
              onChange={(e) => setComment(e.target.value.trimStart())}
              ref={inputRef}
              value={comment}
              name="comment"
              inputProps={{ maxLength: 31 }}
              error={
                comment.length > 30
                  ? "comment must be at most 30 characters"
                  : ""
              }
              helperText={
                comment.length > 30
                  ? "comment must be at most 30 characters"
                  : ""
              }
              size="small"
              sx={{ width: isNonMobileScreens ? "69%" : "65%", ml: "0.5rem" }}
            />
            <Button
              disabled={!comment || comment.trim().length > 30}
              type="submit"
              onClick={submitHandler}
              sx={{
                color: palette.background.alt,
                backgroundColor: palette.primary.main,
                borderRadius: "3rem",
                ml: "0.5rem",
                height: "2rem",
                minWidth: "15%",
              }}
            >
              POST
            </Button>
          </form>
        </>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
