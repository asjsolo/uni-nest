import mongoose from 'mongoose';

const actionLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetId: {
      type: String, // Can be ObjectId or just a string
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ActionLog = mongoose.model('ActionLog', actionLogSchema);

export default ActionLog;
