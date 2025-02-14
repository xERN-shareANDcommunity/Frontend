import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import EmptyGroupMember from "./EmptyGroupMember/EmptyGroupMember";
import { ContainerDiv, Tabul, TabButton } from "./GroupManagement.styles";
import GroupManagementProfile from "./GroupManagementProfile/GroupManagementProfile";
import GroupMemberManagement from "./GroupMemberManagement/GroupMemberManagement";

const GroupManagement = ({ groupInfo, groupMemberList }) => {
	const { user } = useSelector((state) => state.auth);

	const [isGroupProfile, setIsGroupProfile] = useState(true);

	const navigate = useNavigate();

	const { groupId } = groupInfo.information.group;
	const memberList = groupMemberList.filter(
		(member) => member.accessLevel !== "owner",
	);

	useEffect(() => {
		if (!(user.userId === groupInfo.information.leaderInfo.userId)) {
			navigate(`/group/${groupId}`);
		}
	}, []);

	return (
		<ContainerDiv>
			<Tabul role="tablist">
				<li role="tab">
					<TabButton
						onClick={() => setIsGroupProfile(true)}
						isActive={isGroupProfile}
					>
						그룹 프로필
					</TabButton>
				</li>
				<li role="tab">
					<TabButton
						onClick={() => setIsGroupProfile(false)}
						isActive={!isGroupProfile}
					>
						그룹원 관리
					</TabButton>
				</li>
			</Tabul>

			{isGroupProfile ? (
				<GroupManagementProfile groupInfo={groupInfo} />
			) : (
				// eslint-disable-next-line react/jsx-no-useless-fragment
				<>
					{groupMemberList.length < 2 ? (
						<EmptyGroupMember />
					) : (
						<GroupMemberManagement groupId={groupId} memberList={memberList} />
					)}
				</>
			)}
		</ContainerDiv>
	);
};

export default GroupManagement;
