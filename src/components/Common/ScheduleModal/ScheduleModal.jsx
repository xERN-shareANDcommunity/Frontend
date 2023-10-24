import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import _ from "lodash";
import moment from "moment";

import FormModal from "@/components/Common/Modal/FormModal/FormModal";
import { SCHEDULE_MODAL_TYPE, UI_TYPE } from "@/constants/uiConstans";
import {
	createSchedule,
	updateSchedule,
} from "@/features/schedule/schedule-service.js";
import { closeModal, setIsLoading } from "@/features/ui/ui-slice";
import { getSchedule } from "@/utils/calendarUtils";
import { convertScheduleDataToFormValue } from "@/utils/convertSchedule";

import {
	TitleInput,
	DateInput,
	DetailTextarea,
	DateDiv,
	DateContainerDiv,
	FooterDiv,
	SubmitButton,
	ScheduleModalLayoutDiv,
	InputLabel,
	StyledSelect,
	RepeatContainerDiv,
	AllDayCheckBoxDiv,
	ByweekdayPickerDiv,
} from "./ScheduleModal.styles";

const WEEK_STRING_PAIRS = [
	["SU", "일"],
	["MO", "월"],
	["TU", "화"],
	["WE", "수"],
	["TH", "목"],
	["FR", "금"],
	["SA", "토"],
];

const initialFormValues = {
	title: "",
	content: "",
	startDate: moment().format("YYYY-MM-DD"),
	startTime: moment().format("HH:mm"),
	endDate: moment().format("YYYY-MM-DD"),
	endTime: moment().format("HH:mm"),
	freq: "NONE",
	interval: "",
	byweekday: [],
	until: "",
	isAllDay: false,
};

const convertToDateInputValue = (date) => {
	return date.toISOString().slice(0, 10);
};

const getRecurringString = (freqEndsWithN) => {
	if (!freqEndsWithN.endsWith("N")) {
		throw new Error("반복 텍스트는 freq가 N으로 끝나는 경우에만 return합니다");
	}
	if (freqEndsWithN.startsWith("DAILY")) {
		return "일";
	}
	if (freqEndsWithN.startsWith("WEEKLY")) {
		return "주";
	}
	if (freqEndsWithN.startsWith("MONTHLY")) {
		return "개월";
	}
	return "년";
};

const setByweekday = (weekNum, prev, checked) => {
	if (!checked) {
		return prev.filter((num) => num !== weekNum);
	}
	if (prev.indexOf(weekNum) === -1) {
		prev.push(weekNum);
	}
	return prev;
};

const calculateMinUntilDateString = (
	startDateStr,
	freq,
	intervalValue,
	isInfinite = false,
) => {
	const interval = Math.floor(
		Number(intervalValue) > 0 ? Number(intervalValue) : 1,
	);
	if (typeof startDateStr !== "string") {
		throw new Error(
			`startDateStr은 문자열 타입이어야 합니다. 현재 값은 ${startDateStr}입니다.`,
		);
	}
	if (startDateStr.trim() === "") {
		throw new Error(
			`startDateStr은 빈 문자열이 아니어야 합니다. 현재 값은 비어있습니다.`,
		);
	}

	if (freq === "NONE" || isInfinite) {
		return "";
	}
	const startDate = new Date(startDateStr);
	let untilDate = "";
	if (freq === "DAILY" || freq === "DAILY_N") {
		untilDate = startDate.setDate(startDate.getDate() + interval + 1);
	} else if (freq === "WEEKLY" || freq === "WEEKLY_N") {
		untilDate = startDate.setDate(startDate.getDate() + 7 * interval + 1);
	} else if (freq === "MONTHLY" || freq === "MONTHLY_N") {
		startDate.setMonth(startDate.getMonth() + interval);
		untilDate = startDate.setDate(startDate.getDate() + 1);
	} else if (freq === "YEARLY" || freq === "YEARLY_N") {
		startDate.setFullYear(startDate.getFullYear() + interval);
		untilDate = startDate.setDate(startDate.getDate() + 1);
	}
	return new Date(untilDate).toISOString().slice(0, 10);
};

const calculateIsAllDay = (startDate, startTime, endDate, endTime) => {
	return startDate === endDate && startTime === "00:00" && endTime === "23:59";
};

const ScheduleModal = () => {
	const dispatch = useDispatch();

	const prevFormValue = useRef(initialFormValues);

	const { openedModal, scheduleModalMode, scheduleModalId, isLoading } =
		useSelector((state) => state.ui);
	const isEditMode = scheduleModalMode === SCHEDULE_MODAL_TYPE.EDIT;
	const [formValues, setFormValues] = useState(initialFormValues);
	const minStartDate = convertToDateInputValue(
		new Date(new Date().setMonth(new Date().getMonth() - 6)),
	);

	const handleDateValueChange = (event) => {
		const {
			target: { value, id },
		} = event;
		if (id === "startDate") {
			setFormValues((prev) => {
				const endDate =
					!prev.endDate || prev.endDate < value ? value : prev.endDate;
				return {
					...prev,
					startDate: value,
					endDate,
					until: calculateMinUntilDateString(
						value,
						prev.freq,
						prev.interval,
						prev.until === "",
					),
					isAllDay: calculateIsAllDay(
						value,
						prev.startTime,
						endDate,
						prev.endTime,
					),
				};
			});
		} else if (id === "endDate") {
			setFormValues((prev) => {
				const startDate =
					!prev.startDate || prev.startDate > value ? value : prev.startDate;
				return {
					...prev,
					startDate,
					endDate: value,
					isAllDay: calculateIsAllDay(
						startDate,
						prev.startTime,
						value,
						prev.endTime,
					),
				};
			});
		}
	};

	const handleTimeValueChange = (event) => {
		const {
			target: { value, id },
		} = event;
		if (id === "startTime") {
			setFormValues((prev) => {
				return {
					...prev,
					startTime: value,
					isAllDay: calculateIsAllDay(
						prev.startDate,
						value,
						prev.endDate,
						prev.endTime,
					),
				};
			});
		} else if (id === "endTime") {
			setFormValues((prev) => {
				return {
					...prev,
					endTime: value,
					isAllDay: calculateIsAllDay(
						prev.startDate,
						prev.startTime,
						prev.endDate,
						value,
					),
				};
			});
		}
	};

	const handleAlldayValueChange = (event) => {
		const { checked } = event.target;
		setFormValues((prev) => ({
			...prev,
			isAllDay: checked,
			endDate: checked ? prev.startDate : prev.endDate,
			startTime: checked ? "00:00" : prev.startTime,
			endTime: checked ? "23:59" : prev.endTime,
		}));
	};

	const handleIntervalChange = (event) => {
		const {
			target: { value },
		} = event;
		if (Number.isNaN(Number(value))) {
			return;
		}
		setFormValues((prev) => ({
			...prev,
			interval: Number(value) >= 0 ? value : 1,
			until: calculateMinUntilDateString(
				prev.startDate,
				prev.freq,
				value,
				Boolean(!prev.until),
			),
		}));
	};

	const checkTimeIsValid = () => {
		if (formValues.startDate < formValues.endDate) {
			return true;
		}
		if (formValues.startDate === formValues.endDate) {
			if (formValues.startTime < formValues.endTime) {
				return true;
			}
			toast.error("시작 시간은 종료 시간보다 빨라야 합니다.");
			return false;
		}
		toast.error("종료 날짜는 시작 날짜보다 동일하거나 빠를 수 없습니다.");
		return false;
	};

	const checkIntervalIsValid = () => {
		if (
			formValues.freq !== "NONE" &&
			(!Number.isInteger(Number(formValues.interval)) ||
				Number(formValues.interval) <= 0)
		) {
			toast.error("반복 간격은 0보다 큰 자연수여야 합니다");
			return false;
		}
		return true;
	};

	const checkByweekdayIsValid = () => {
		if (!formValues.freq.startsWith("WEEKLY")) return true;
		if (
			formValues.byweekday.indexOf(new Date(formValues.startDate).getDay()) ===
			-1
		) {
			toast.error(
				"반복 요일은 무조건 일정 시작 날짜에 해당하는 요일을 포함해야 합니다.",
			);
			return false;
		}
		return true;
	};

	const checkUntilIsValid = () => {
		if (formValues.until && formValues.startDate >= formValues.until) {
			toast.error("반복 종료 일자는 일정 시작 날짜보다 커야 합니다.");
			return false;
		}
		if (
			!formValues.until ||
			formValues.until >=
				calculateMinUntilDateString(
					formValues.startDate,
					formValues.freq,
					formValues.interval,
				)
		) {
			return true;
		}
		toast.error(
			`반복 종료 일자는 최소 ${formValues.interval}${getRecurringString(
				formValues.freq,
			)} 이후여야 합니다.`,
		);
		return false;
	};

	const checkFormIsFilledOrChanged = () => {
		const trimmedFormValues = {
			...formValues,
			title: formValues.title.trim(),
			content: formValues.content.trim(),
		};
		if (_.isEqual(trimmedFormValues, prevFormValue.current)) {
			return false;
		}
		return (
			formValues.title.trim() !== "" &&
			formValues.content.trim() !== "" &&
			formValues.startDate !== "" &&
			formValues.startTime !== "" &&
			formValues.endDate !== "" &&
			formValues.endTime !== "" &&
			(formValues.freq === "NONE" || formValues.interval > 0) &&
			(formValues.freq === "WEEKLY" ? formValues.byweekday.length > 0 : true) &&
			(openedModal === UI_TYPE.SHARE_SCHEDULE
				? formValues.voteEndDate !== "" && formValues.voteEndTime !== ""
				: true)
		);
	};

	const handleSubmit = () => {
		// form 유효성 검사
		if (
			!checkTimeIsValid() ||
			!checkIntervalIsValid() ||
			!checkByweekdayIsValid() ||
			!checkUntilIsValid()
		) {
			return;
		}

		// 일정 저장 로직
		if (!isEditMode) {
			dispatch(createSchedule(formValues));
		} else {
			dispatch(updateSchedule({ schedule: formValues, id: scheduleModalId }));
		}

		// 폼 초기화
		setFormValues(initialFormValues);

		// 메뉴 닫기
		dispatch(closeModal());
	};

	useEffect(() => {
		// set byweekday
		if (
			!(formValues.freq === "WEEKLY" || formValues.freq === "WEEKLY_N") ||
			!formValues.startDate
		) {
			return;
		}
		const weekNum = new Date(formValues.startDate).getDay();
		setFormValues((prev) => ({
			...prev,
			byweekday:
				prev.byweekday.indexOf(weekNum) === -1 ? [weekNum] : prev.byweekday,
		}));
	}, [formValues.startDate, formValues.freq]);

	useEffect(() => {
		if (isEditMode) {
			getSchedule(scheduleModalId, (schedule) => {
				dispatch(setIsLoading(false));
				setFormValues(convertScheduleDataToFormValue(schedule));
				prevFormValue.current = convertScheduleDataToFormValue(schedule);
			});
		} else {
			dispatch(setIsLoading(false));
		}

		return () => {
			dispatch(closeModal());
		};
	}, [isEditMode, scheduleModalId]);

	return (
		<FormModal
			title={isEditMode ? "일정 수정" : "일정 추가"}
			isEmpty={!checkFormIsFilledOrChanged()}
		>
			<ScheduleModalLayoutDiv>
				<TitleInput
					id="title"
					type="text"
					placeholder="일정 제목"
					value={formValues.title}
					onChange={(e) =>
						setFormValues((prev) => ({ ...prev, title: e.target.value }))
					}
				/>
				<DetailTextarea
					id="content"
					rows="5"
					placeholder="상세 내용"
					value={formValues.content}
					onChange={(e) =>
						setFormValues((prev) => ({ ...prev, content: e.target.value }))
					}
				/>
				<InputLabel htmlFor="startDate">날짜 및 시간</InputLabel>
				<DateContainerDiv>
					<DateDiv>
						<DateInput
							id="startDate"
							type="date"
							min={minStartDate}
							value={formValues.startDate}
							onChange={handleDateValueChange}
						/>
						<DateInput
							id="startTime"
							type="time"
							value={formValues.startTime}
							onChange={handleTimeValueChange}
						/>
					</DateDiv>
					~
					<DateDiv>
						<DateInput
							id="endDate"
							type="date"
							disabled={!formValues.startDate}
							min={formValues.endDate}
							value={formValues.endDate}
							onChange={handleDateValueChange}
						/>
						<DateInput
							id="endTime"
							type="time"
							min={
								formValues.startDate === formValues.endDate
									? formValues.startTime
									: undefined
							}
							value={formValues.endTime}
							onChange={handleTimeValueChange}
						/>
					</DateDiv>
					{formValues.startDate && (
						<AllDayCheckBoxDiv>
							<label>
								<input
									type="checkbox"
									onChange={handleAlldayValueChange}
									checked={formValues.isAllDay}
								/>
								하루 종일
							</label>
						</AllDayCheckBoxDiv>
					)}
				</DateContainerDiv>
				{openedModal === UI_TYPE.SHARE_SCHEDULE ? (
					<>
						<InputLabel>일정 투표 종료일</InputLabel>
						<DateContainerDiv>
							<DateDiv>
								<DateInput
									type="date"
									min={minStartDate}
									value={formValues.voteEndDate}
									onChange={(e) =>
										setFormValues({
											...formValues,
											voteEndDate: e.target.value,
										})
									}
								/>
								<DateInput
									type="time"
									value={formValues.voteEndTime}
									onChange={(e) =>
										setFormValues({
											...formValues,
											voteEndTime: e.target.value,
										})
									}
								/>
							</DateDiv>
						</DateContainerDiv>
					</>
				) : (
					formValues.startDate &&
					formValues.endDate && (
						<RepeatContainerDiv>
							<div>
								<div>
									<InputLabel htmlFor="frequency">반복 여부</InputLabel>
									<StyledSelect
										id="frequency"
										value={formValues.freq}
										onChange={(e) =>
											setFormValues((prev) => ({
												...prev,
												freq: e.target.value,
												interval: e.target.value !== "NONE" ? 1 : "",
												until: calculateMinUntilDateString(
													prev.startDate,
													e.target.value,
													1,
													Boolean(!prev.until),
												),
											}))
										}
									>
										<option value="NONE">반복 안함</option>
										<option value="DAILY">매일</option>
										<option value="DAILY_N">N일 간격</option>
										<option value="WEEKLY">매주</option>
										<option value="WEEKLY_N">N주 간격</option>
										<option value="MONTHLY">매월</option>
										<option value="MONTHLY_N">N개월 간격</option>
										<option value="YEARLY">매년</option>
										<option value="YEARLY_N">N년 간격</option>
									</StyledSelect>
								</div>
								{formValues.freq !== "NONE" && (
									<>
										<div>
											<InputLabel htmlFor="until">반복 종료</InputLabel>
											<StyledSelect
												id="until"
												value={formValues.until === "" ? "NO" : "YES"}
												onChange={(e) =>
													setFormValues((prev) => ({
														...prev,
														until: calculateMinUntilDateString(
															prev.startDate,
															prev.freq,
															prev.interval,
															e.target.value === "NO",
														),
													}))
												}
											>
												<option value="NO">안 함</option>
												<option value="YES">날짜</option>
											</StyledSelect>
										</div>
										{formValues.until !== "" && (
											<div>
												<InputLabel>반복 종료 날짜</InputLabel>
												<DateInput
													type="date"
													min={calculateMinUntilDateString(
														formValues.startDate,
														formValues.freq,
														formValues.interval,
													)}
													value={formValues.until}
													onChange={(e) =>
														setFormValues((prev) => ({
															...prev,
															until: e.target.value,
														}))
													}
												/>
											</div>
										)}
									</>
								)}
							</div>
							<div>
								{(formValues.freq === "WEEKLY" ||
									formValues.freq === "WEEKLY_N") && (
									<ByweekdayPickerDiv>
										{WEEK_STRING_PAIRS.map(([EN, KR], index) => (
											<label key={EN} htmlFor={EN}>
												<span>{KR}</span>
												<div>
													<input
														type="checkbox"
														id={EN}
														checked={formValues.byweekday.indexOf(index) !== -1}
														onChange={({ target: { checked } }) => {
															setFormValues((prev) => ({
																...prev,
																byweekday:
																	new Date(formValues.startDate).getDay() ===
																	index
																		? prev.byweekday
																		: setByweekday(
																				index,
																				prev.byweekday,
																				checked,
																		  ),
															}));
														}}
													/>
												</div>
											</label>
										))}
									</ByweekdayPickerDiv>
								)}
								{formValues.freq.endsWith("N") && (
									<div className="interval_N">
										<input
											id="interval"
											type="number"
											step={1}
											min={1}
											value={formValues.interval}
											onChange={handleIntervalChange}
										/>
										<span>
											{`${getRecurringString(
												formValues.freq,
											)} 간격으로 반복합니다.`}
										</span>
									</div>
								)}{" "}
							</div>
						</RepeatContainerDiv>
					)
				)}
				<FooterDiv
					isAllDayCheckboxDisplayed={
						formValues.startDate && !formValues.endDate
					}
				>
					<SubmitButton
						onClick={handleSubmit}
						disabled={!checkFormIsFilledOrChanged() || isLoading}
					>
						{isEditMode ? "수정하기" : "저장하기"}
					</SubmitButton>
				</FooterDiv>
			</ScheduleModalLayoutDiv>
		</FormModal>
	);
};

export default ScheduleModal;
