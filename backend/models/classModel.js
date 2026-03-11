import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // "Class 1"
  description: { type: String }
}, { timestamps: true });

export const Class = mongoose.model("Class", classSchema);















// import mongoose from "mongoose";

// const sectionSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // e.g., "A"
//   classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
//   subjects: [{
//     subject: { type: String, required: true },   // ✅ store subject name as string
//     teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }]
//   }],
//   students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
// }, { timestamps: true });

// sectionSchema.index({ name: 1 });

// const classSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true }, // e.g., "10th"
//   sections: {
//     type: [sectionSchema],
//     validate: {
//       validator: function (sections) {
//         const names = sections.map(s => s.name);
//         return names.length === new Set(names).size; // no duplicates
//       },
//       message: "Duplicate section names are not allowed in a class"
//     }
//   }
// }, { timestamps: true });

// // classSchema.index({ name: 1 });

// export const Class = mongoose.model("Class", classSchema);
