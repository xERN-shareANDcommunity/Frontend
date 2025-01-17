import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import GroupInfoList from "@/components/Group/GroupInfoList/GroupInfoList";
import MyGroup from "@/components/Group/MyGroup/MyGroup";
import MyGroupFeed from "@/components/Group/MyGroupFeed/MyGroupFeed";
import { SearchIcon } from "@/constants/iconConstants";
import {
	TAB_CONSTANTS_TITLE,
	TAB_KEY,
	TAB_PARAM,
} from "@/constants/tabConstants";

import {
	ContainerDiv,
	FeedDiv,
	FeedTitleDiv,
	SearchDiv,
	Input,
	SearchButton,
	TabUl,
	TabButton,
} from "./CommunityPage.styles";

const CommunityPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const [searchKeyword, setSearchKeyword] = useState("");
	const [onSearch, setOnSearch] = useState(false);

	const handleSearchInput = (e) => {
		setSearchKeyword(e.target.value.trim());
	};

	const handleSearchClick = () => {
		if (searchKeyword.length <= 1) {
			setOnSearch(false);
			toast.error("2글자 이상부터 검색 가능합니다.");
		} else {
			setOnSearch(true);
		}
	};

	const handleSearchKeyDown = (event) => {
		if (event.key === "Enter") {
			handleSearchClick();
		}
	};

	useEffect(() => {
		if (
			!searchParams ||
			(searchParams.get(TAB_KEY) !== TAB_PARAM.MY_GROUP_FEED &&
				searchParams.get(TAB_KEY) !== TAB_PARAM.GROUP_SEARCH)
		) {
			setSearchParams(`${TAB_KEY}=${TAB_PARAM.MY_GROUP_FEED}`);
		}
	}, []);

	return (
		<ContainerDiv>
			<MyGroup />
			<FeedDiv>
				<FeedTitleDiv>
					<TabUl role="tablist">
						<li role="tab">
							<TabButton
								isActive={searchParams.get(TAB_KEY) === TAB_PARAM.MY_GROUP_FEED}
								onClick={() =>
									setSearchParams(`${TAB_KEY}=${TAB_PARAM.MY_GROUP_FEED}`)
								}
							>
								{TAB_CONSTANTS_TITLE.MY_GROUP_FEED}
							</TabButton>
						</li>
						<li role="tab">
							<TabButton
								isActive={searchParams.get(TAB_KEY) === TAB_PARAM.GROUP_SEARCH}
								onClick={() =>
									setSearchParams(`${TAB_KEY}=${TAB_PARAM.GROUP_SEARCH}`)
								}
							>
								{TAB_CONSTANTS_TITLE.GROUP_SEARCH}
							</TabButton>
						</li>
					</TabUl>

					{searchParams.get(TAB_KEY) === TAB_PARAM.GROUP_SEARCH && (
						<SearchDiv>
							<Input
								placeholder="다른 그룹을 탐색해보세요."
								onChange={handleSearchInput}
								onKeyDown={handleSearchKeyDown}
							/>
							<SearchButton onClick={handleSearchClick}>
								<SearchIcon />
							</SearchButton>
						</SearchDiv>
					)}
				</FeedTitleDiv>

				{searchParams.get(TAB_KEY) === TAB_PARAM.GROUP_SEARCH ? (
					<GroupInfoList
						onSearch={onSearch}
						clearOnSearch={() => setOnSearch(false)}
						clearSearchKeyword={() => setSearchKeyword("")}
						searchKeyword={searchKeyword}
						searchParams={searchParams}
					/>
				) : (
					<MyGroupFeed />
				)}
			</FeedDiv>
		</ContainerDiv>
	);
};

export default CommunityPage;
