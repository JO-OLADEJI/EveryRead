import { ObjectId } from "mongoose";
import cron, { ScheduledTask } from "node-cron";
import Excerpt from "../models/Excerpt.model";

class AutomateController {
  // number of reviews for each excerpt
  NUMBER_OF_PRESET_REVIEWS = 20;

  // object tracking all reminders scheduled for all excerpts
  SCHEDULED_TASKS: { [x: string]: ScheduledTask[] } = {};

  // returns the timestamp of `n`th review of an excerpt
  getReviewTimestamp = (
    nthReview: number,
    msTimestampOfFirstLearning: number
  ) => {
    // const now = new Date().valueOf();
    const timezoneOffeset = new Date().getTimezoneOffset();
    const msLocalTimestampOfFirstLearning =
      msTimestampOfFirstLearning + timezoneOffeset * 60 * 1000 * -1;

    const MILLISECONDS_IN_DAY = 60 * 60 * 24 * 1000;
    const MILLISECONDS_IN_MINUTES = 60 * 1000; // for testing
    const reviewDay = 2.66667 * Math.exp(0.405465 * nthReview) - 3;
    return (
      Math.floor(MILLISECONDS_IN_MINUTES * reviewDay) +
      msLocalTimestampOfFirstLearning
    );
  };

  // takes a timestamp and turns it to `cron` format
  formatCronString = (msTimestamp: number) => {
    // ┌────────────── second (optional)
    // │ ┌──────────── minute
    // │ │ ┌────────── hour
    // │ │ │ ┌──────── day of month
    // │ │ │ │ ┌────── month
    // │ │ │ │ │ ┌──── day of week
    // │ │ │ │ │ │
    // │ │ │ │ │ │
    // * * * * * *

    const dateRepr = new Date(msTimestamp);
    const timestamp = Math.floor(msTimestamp / 1000);

    const minute = Math.floor(timestamp / 60) % 60;
    const hour = Math.floor(timestamp / 3600) % 24;
    const dayOfMonth = dateRepr.getDate();
    const month = dateRepr.getMonth() + 1;
    const dayOfWeek = dateRepr.getDay();

    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  };

  // schedule reviews for an excerpt
  scheduleSpacedReminders = async (excerptId: ObjectId): Promise<boolean> => {
    // - read timestamp excerpt was last updated
    const excerpt = await Excerpt.findById(excerptId).populate("note", "title");
    if (!excerpt) {
      return false;
    }

    // - clear all queued reminders for excerpt
    this.clearSpacedReminders(excerptId);

    const scheduledReviews: number[] = [];
    const scheduledTasks: ScheduledTask[] = [];

    // - get timestamp of reminders
    const lastUpdate: number = new Date((excerpt as any).updatedAt).valueOf();
    for (let i = 1; i <= this.NUMBER_OF_PRESET_REVIEWS; ++i) {
      scheduledReviews.push(this.getReviewTimestamp(i, lastUpdate));
    }

    // - queue reminders for excerpt
    scheduledReviews.forEach((reviewMsTimestamp, index) => {
      // 1. convert each timestamp to parsable node-cron string
      const cronString = this.formatCronString(reviewMsTimestamp);

      // 2. schedule 20 tasks for excerpt and track all tasks in an array
      const task = cron.schedule(cronString, () => {
        console.log({
          title: (excerpt.note as any).title,
          content: excerpt.content,
        });
      });
      scheduledTasks.push(task);

      // 3. add cron tasks to the SCHEDULED_TASKS object
      this.SCHEDULED_TASKS[excerpt.id] = scheduledTasks;
    });

    return true;
  };

  // clear scheduled reviews for an excerpt
  clearSpacedReminders = (excerptId: ObjectId): boolean => {
    const scheduledTasks: ScheduledTask[] | undefined =
      this.SCHEDULED_TASKS[String(excerptId)];

    if (scheduledTasks) {
      scheduledTasks.forEach((task) => {
        task.stop();
      });
      delete this.SCHEDULED_TASKS[String(excerptId)];
    }

    return true;
  };
}

const automateController = new AutomateController();
export default automateController;
