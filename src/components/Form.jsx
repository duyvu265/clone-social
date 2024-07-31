import React, { useState, useRef } from "react";
import { Box, Button, Typography, useMediaQuery, useTheme, Collapse, Alert, IconButton, InputAdornment } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "../store/index";


import { Visibility, VisibilityOff } from "@mui/icons-material";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from "../firebase";
import InputField from "./Form/InputField";
import ImageUpload from "./Form/ImageUpload";
import AlertMessage from "./Form/AlertMessage";
import OtpField from "./Form/OtpField";

const registerSchema = yup.object().shape({
  firstName: yup.string().required("required").min(2).max(12),
  lastName: yup.string().required("required").min(2).max(12),
  email: yup.string().email("invalid email").required("required").max(50),
  password: yup.string().required("required").min(5),
  location: yup.string().required("required"),
  occupation: yup.string().required("required"),
  picture: yup.string().required("required"),
});

const loginSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required").max(50),
  password: yup.string().required("required").min(5),
});

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  location: "",
  occupation: "",
  picture: "",
  otp: "",
};

const Form = () => {
  const [pageType, setPageType] = useState("login");
  const [error, setError] = useState("");
  const [clicked, setClicked] = useState(false);
  const [otpClick, setOtpClick] = useState(false);
  const [validOtp, setValidOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(null);
  const otpRef = useRef(null);
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";


  const uploadImage = async (image) => {
    console.log("Received image: ", image);
    if (image) {
      try {
        console.log(image, "uploading...image");
        const fileName = new Date().getTime() + image.name;
        const storage = getStorage();
        console.log("Storage instance: ", storage);
        const storageRef = ref(storage, fileName);
  
        console.log("StorageRef: ", storageRef);
        console.log("Image to be uploaded: ", image);
  
        const uploadTask = uploadBytesResumable(storageRef, image);
        console.log("UploadTask created: ", uploadTask);
  
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            console.log("Upload task state changed: ", snapshot.state);
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            console.error("Upload failed", error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("Download URL: ", downloadURL);
              setImage(downloadURL);
            } catch (error) {
              console.error("Error getting download URL: ", error);
            }
          }
        );
      } catch (error) {
        console.error("Unexpected error: ", error);
      }
    } else {
      console.log("No image selected");
    }
  };
  const register = async (values, { resetForm }) => {
    const verified = await verifyOtp();
    if (!verified) {
      setError("Invalid Otp!");
      setOtpClick(false);
      values.otp = "";
      setClicked(false);
      return;
    }

    values.email = values.email.toLowerCase();
    const formData = { ...values, profilePhoto: image };

    const savedUserResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer your-token-here',
        'Custom-Header': 'CustomValue'
      },
      body: JSON.stringify(formData),
    });

    const savedUser = await savedUserResponse.json();
    resetForm();
    setClicked(false);
    if (savedUser.error) {
      setError("User with this email already exists!");
      setOtpClick(false);
      return;
    }
    if (savedUser) {
      setPageType("login");
    }
  };

  const login = async (values, onSubmitProps) => {
    values.email = values.email.toLowerCase();
    onSubmitProps.resetForm();
    const loggedInResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer your-token-here',
        'Custom-Header': 'CustomValue'
      },
      body: JSON.stringify(values),
    });
    const loggedIn = await loggedInResponse.json();
    setClicked(false);
    if (loggedIn.msg) {
      setError("Invalid Credentials!");
      return;
    }
    if (loggedIn) {
      dispatch(setLogin({ user: loggedIn.user, token: loggedIn.token }));
      navigate("/home");
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    setClicked(true);
    if (isLogin) await login(values, onSubmitProps);
    if (isRegister) await register(values, onSubmitProps);
  };

  const sendOtp = async () => {
    if (image) await uploadImage(image);
    console.log("send otp...");
    setClicked(true);
    setOtpClick(true);
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/register/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer your-token-here',
        'Custom-Header': 'CustomValue'
      },
      body: JSON.stringify({
        email: otpRef.current.values.email,
        name: `${otpRef.current.values.firstName} ${otpRef.current.values.lastName}`,
      }),
    });
    console.log("check response", response);
    const otp = await response.json();
    if (otp.error) {
      setClicked(false);
      setOtpClick(false);
      console.log("error here");
      return;
    }
    if (otp) {
      setValidOtp(otp);
      setClicked(false);
    }
  };

  const verifyOtp = async () => {
    return String(otpRef.current.values.otp) === String(validOtp);
  };
  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={initialValues}
      validationSchema={isLogin ? loginSchema : registerSchema}
      innerRef={otpRef}
    >
      {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue, resetForm }) => (
        <form onSubmit={handleSubmit}>
          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}
          >
            {isRegister && (
              <>
                <InputField label="First Name" name="firstName" value={values.firstName} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.firstName && errors.firstName)} helperText={touched.firstName && errors.firstName} />
                <InputField label="Last Name" name="lastName" value={values.lastName} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.lastName && errors.lastName)} helperText={touched.lastName && errors.lastName} />
                <InputField label="Location" name="location" value={values.location} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.location && errors.location)} helperText={touched.location && errors.location} />
                <InputField label="Occupation" name="occupation" value={values.occupation} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.occupation && errors.occupation)} helperText={touched.occupation && errors.occupation} />
                <ImageUpload setFieldValue={setFieldValue} values={values} palette={palette} setImage={setImage} />
              </>
            )}
            <InputField label="Email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.email && errors.email)} helperText={touched.email && errors.email} />
            <InputField label="Password" type={showPassword ? "text" : "password"} name="password" value={values.password} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.password && errors.password)} helperText={touched.password && errors.password} InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }} />
            {!error && !isLogin && otpClick && <OtpField values={values} handleBlur={handleBlur} handleChange={handleChange} touched={touched} />}
          </Box>

          {/* ALERT */}
          <AlertMessage error={error} setError={setError} />

          {pageType === "login" && (
            <Typography
              onClick={() => navigate("/forgot/password")}
              sx={{
                textDecoration: "underline",
                color: palette?.primary.main,
                mt: "1rem",
                pl: "0.2rem",
                "&:hover": { cursor: "pointer", color: palette?.primary.light },
              }}
            >
              Forgot Password?
            </Typography>
          )}

          <Box>
            <Button
              fullWidth
              type="submit"
              sx={{
                m: pageType === "login" ? "1rem 0" : "2rem 0",
                p: "1rem",
                backgroundColor: !clicked ? palette?.primary.main : "#808080",
                color: !clicked ? palette.background.alt : "#101010",
                "&:hover": { color: !clicked ? palette?.primary.main : null, backgroundColor: !clicked ? null : "#808080" },
                "&:disabled": { color: !clicked ? palette.background.alt : "#101010" },
              }}
              disabled={
                clicked ||
                (!values.email && !values.password) ||
                (pageType === "login" ? Object.keys(errors).length !== 0 : !values.firstName || !values.lastName || !values.location || !values.occupation || !values.picture || Object.keys(errors).length !== 0) ||
                (!isLogin && otpClick && (!values.otp || values.otp.length !== 4))
              }
              onClick={!otpClick && pageType !== "login" ? sendOtp : null}
            >
              {!clicked ? (isLogin ? "LOGIN" : !isLogin && !otpClick ? "VERIFY EMAIL / SEND OTP" : "VERIFY OTP AND REGISTER") : "WAIT..."}
            </Button>
            <Typography
              onClick={() => {
                setPageType(isLogin ? "register" : "login");
                resetForm();
              }}
              sx={{
                textDecoration: "underline",
                color: palette?.primary.main,
                "&:hover": { cursor: "pointer", color: palette?.primary.light },
              }}
            >
              {isLogin ? "Don't have an account? Sign Up here." : "Already have an account? Login here."}
            </Typography>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default Form;
