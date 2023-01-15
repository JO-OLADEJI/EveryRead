import { ObjectId } from "mongoose";
import cron from "node-cron";
import Excerpt from "../models/Excerpt.model";

class AutomateController {
  NUMBER_OF_PRESET_REVIEWS = 20;
  SCHEDULED_TASKS = {};

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
    // - read timestamp excerpt was last updated
    const excerpt = await Excerpt.findById(excerptId);
    if (!excerpt) {
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
    // 1. convert each timestamp to parsable node-cron string
    // 2. schedule 20 tasks for excerpt and track all tasks in an array
    // 3. add cron tasks to the SCHEDULED_TASKS object

    // cron.schedule()

    return true;
  };
}

const automateController = new AutomateController();
export default automateController;
