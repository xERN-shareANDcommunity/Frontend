import React, { useState } from "react";

import { AgreeLabel } from "./First.style";
import { ButtonWrapDiv, ContentP, WithdrawalButton } from "./shared.style";

const First = ({ handleFirst }) => {
	const [isAgree, setIsAgree] = useState(false);

	return (
		<>
			<h3>회원 탈퇴 전, 꼭 확인하세요!</h3>
			<ContentP>
				<span>
					계정을 탈퇴하면 계정 정보 및 현재 이용중인 세부 서비스의 모든 정보가
					삭제됩니다.
				</span>
				<br />
				탈퇴한 후에는 더 이상 해당 계정으로 로그인 할 수 없으므로, 모든 세부
				서비스들도 이용할 수 없게 됩니다.
				<br />
				탈퇴된 개인 정보와 서비스 이용기록 등은 복구할 수 없으니 신중하게
				선택하시길 바랍니다.
			</ContentP>
			<AgreeLabel>
				<input
					type="checkbox"
					id="hidden-checkbox"
					defaultChecked={isAgree}
					onClick={() => setIsAgree((prev) => !prev)}
				/>
				<div id="shown-checkbox" />
				<span>상기 탈퇴 시 유의 사항을 확인하였습니다.</span>
			</AgreeLabel>
			<ButtonWrapDiv>
				<WithdrawalButton onClick={handleFirst} disabled={!isAgree}>
					탈퇴하기
				</WithdrawalButton>
			</ButtonWrapDiv>
		</>
	);
};

export default First;