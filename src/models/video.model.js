import mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new mongoose.Schema(
     {
          videofile: {
               types: String,
               required: true
          },
          thumbnail: {
               types: String,
               required: true
          },
          title: {
               types: String,
               required: true
          },
          description: {
               types: Number,
               required: true
          },
          views: {
               types: Number,
               default: 0
          },
          isPublished: {
               types: Boolean,
               default: true
          },
          owner: {
               types: Schema.Types.ObjectId,
               ref: "User"
          }
     },
     { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);