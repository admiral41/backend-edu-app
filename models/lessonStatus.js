const mongoose = require('mongoose')
const Schema = mongoose.Schema

const lessonStatusSchema = new Schema(
  {
    learner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    }
  },
  {
    timestamps: true,
  }
)

// hide some attributes of lessonStatus model while sending json response
lessonStatusSchema.methods.toJSON = function () {
  let lessonStatus = this.toObject()
  delete lessonStatus.createdAt
  delete lessonStatus.updatedAt
  delete lessonStatus.__v
  return lessonStatus
}

const LessonStatus = mongoose.model('lesson_status', lessonStatusSchema)
module.exports = LessonStatus
