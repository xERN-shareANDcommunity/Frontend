import { toast } from "react-toastify";

import { createSlice } from "@reduxjs/toolkit";

import { VIEW_TYPE } from "@/constants/calendarConstants.js";

import { createSchedule, getSchedule } from "./schedule-service.js";

const initialState = {
	totalSchedule: [],
	schedule: [],
	recSchedules: [],
	month: 0,
	year: 0,
	isLoading: false,
	id: null,
	currentCalendarView: VIEW_TYPE.DAY_GRID_MONTH,
};

const scheduleSlice = createSlice({
	name: "schedule",
	initialState,
	reducers: {
		saveSchedule: (state, { payload }) => {
			state.schedule = [...state.schedule, payload];
		},
		currentMonthFn: (state, { payload }) => {
			state.month = payload;
		},
		currentYearFn: (state, { payload }) => {
			state.year = payload;
		},
		setId: (state, { payload }) => {
			state.id = payload;
		},
		setCurrentCalenderView: (state, { payload }) => {
			if (
				payload === VIEW_TYPE.DAY_GRID_MONTH ||
				payload === VIEW_TYPE.DAY_GRID_WEEK
			) {
				state.currentCalendarView = payload;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createSchedule.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(createSchedule.fulfilled, (state) => {
				state.isLoading = false;
				toast.success("일정 추가에 성공하셨습니다!");
			})
			.addCase(createSchedule.rejected, (state) => {
				state.isLoading = false;
			})
			.addCase(getSchedule.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(getSchedule.fulfilled, (state, { payload }) => {
				state.isLoading = false;
				state.schedule = payload.nonRecurrenceSchedule;
				state.recSchedules = payload.recurrenceSchedule;
				state.totalSchedule = [
					...payload.nonRecurrenceSchedule,
					...state.recSchedules,
				];
			})
			.addCase(getSchedule.rejected, (state) => {
				state.isLoading = false;
			});
	},
});

export const {
	saveSchedule,
	currentMonthFn,
	currentYearFn,
	setId,
	setCurrentCalenderView,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
