import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import Option from "@/assets/icon/ic-feed-option.svg";
import SampleImg from "@/assets/img/feed/img-group-sample-01.jpeg";
import { deleteGroupMember } from "@/features/group/group-service";

import {
	MemberInnerDiv,
	MemberH3,
	MemberUl,
	OptionMenuDiv,
} from "./GroupMember.styles";

const MemberList = () => {
	const [open, setOpen] = useState(false);
	const [openArr, setOpenArr] = useState([false]);

	const dispatchFn = useDispatch();

	const groupInfoDetail = useSelector((state) => state.group.groupInfoDetail);

	const handleOption = (num) => {
		const newOpen = [...openArr];
		newOpen[num] = !open;
		setOpenArr(newOpen);
		setOpen(!open);
	};

	const deleteMember = (groupId, userId) => {
		dispatchFn(deleteGroupMember({ groupId, userId }));
	};

	return (
		<MemberInnerDiv>
			<MemberH3>그룹원</MemberH3>
			<MemberUl>
				{groupInfoDetail?.information.memberInfo.map((info) => (
					<li key={info.userId}>
						<img src={SampleImg} alt="sampleImg" />
						<h4>{info.nickname}</h4>
						<button type="button">
							<Option
								onClick={() => {
									handleOption(info.userId);
								}}
							/>
							<OptionMenuDiv
								style={{ display: openArr[info.userId] ? "flex" : "none" }}
								onClick={() => {
									deleteMember(20, info.userId);
								}}
							>
								내보내기
							</OptionMenuDiv>
						</button>
					</li>
				))}
			</MemberUl>
		</MemberInnerDiv>
	);
};

export default MemberList;