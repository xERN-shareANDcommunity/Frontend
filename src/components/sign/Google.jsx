import React from "react";
import { useDispatch } from "react-redux";

import { useGoogleLogin } from "@react-oauth/google";

import { GoogleLogoIcon } from "@/constants/iconConstants";
import { googleLogin } from "@/features/auth/auth-service";

const Google = () => {
	const dispatch = useDispatch();

	const loginWithGoogle = useGoogleLogin({
		onSuccess: (response) => {
			dispatch(googleLogin(response));
		},
		onError: (response) => {
			dispatch(googleLogin(response));
		},
	});

	return (
		<button
			type="button"
			id="google-login"
			data-testid="google-login"
			onClick={loginWithGoogle}
		>
			<GoogleLogoIcon />
		</button>
	);
};

export default Google;
