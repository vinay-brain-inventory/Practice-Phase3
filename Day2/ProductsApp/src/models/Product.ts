import mongoose, { type InferSchemaType } from "mongoose";

export const productCategories = ["electronics", "fashion", "grocery", "books", "home"] as const;
export type ProductCategory = (typeof productCategories)[number];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000
    },
    category: {
      type: String,
      required: true,
      enum: productCategories,
      index: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    currency: {
      type: String,
      required: true,
      enum: ["INR", "USD"],
      default: "INR"
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

productSchema.index({ category: 1, price: 1 });
productSchema.index({ ownerId: 1, createdAt: -1 });
productSchema.index({ name: "text", description: "text" }, { weights: { name: 5, description: 1 } });

export type ProductDoc = InferSchemaType<typeof productSchema>;
export const ProductModel = mongoose.model("Product", productSchema);

