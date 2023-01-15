import { ObjectId } from "mongoose";
import { ApiErrorResponse, ApiSuccessResponse } from "../types";
import Excerpt from "../models/Excerpt.model";

class AutomateController {
  NUMBER_OF_PRESET_REVIEWS = 20;

  getReviewTimestamp = (
    nthReview: number,
    timestampOfFirstLearning: number
  ) => {
    const MILLISECONDS_IN_DAY = 60 * 60 * 24 * 1000;
    const reviewDay = 2.66667 * Math.exp(0.405465 * nthReview) - 3;
    return (
      Math.floor(MILLISECONDS_IN_DAY * reviewDay) + timestampOfFirstLearning
    );
  };

  scheduleSpacedReminders = async (excerptId: ObjectId): Promise<boolean> => {
    const successResponse: ApiSuccessResponse = { success: true, result: "" };
    const errorResponse: ApiErrorResponse = { success: false, error: "" };

    // - read timestamp excerpt was last updated
    const excerpt = await Excerpt.findById(excerptId);
    if (!excerpt) {
      errorResponse.error = "excerpt not found";
      return false;
    }

    // - clear all queued (cron job) reminders for excerpt

    // - get timestamp of reminders
    const scheduledReviews = [];
    const lastUpdate = new Date((excerpt as any).updatedAt).valueOf();
    for (let i = 1; i <= this.NUMBER_OF_PRESET_REVIEWS; ++i) {
      scheduledReviews.push(this.getReviewTimestamp(i, lastUpdate));
    }

    // - queue (cron jobs) reminders for excerpt

    return true;
  };
}

const automateController = new AutomateController();
export default automateController;
