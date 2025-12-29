const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    categorySlug: {
      type: String,
      unique: true,
      slug: "categoryName",
      index: true,
    },
    categoryShortDesc: {
      type: String,
      required: false,
      trim: true,
    },
    categoryDesc: {
      type: String,
      required: true,
      trim: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: false
    },
    image: {
      type: String,
      required: false,
    },
    icon: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      default: '#667eea',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    meta: {
      courseCount: {
        type: Number,
        default: 0,
      },
      learnerCount: {
        type: Number,
        default: 0,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Hide sensitive data
categorySchema.methods.toJSON = function () {
  let category = this.toObject();
  delete category.__v;
  return category;
};

// Fuzzy searching plugin
categorySchema.plugin(mongoose_fuzzy_searching, {
  fields: [
    {
      name: 'categoryName',
      minSize: 3,
    },
    {
      name: 'categoryDesc',
      minSize: 3,
    },
  ],
});

// Virtual for child categories
categorySchema.virtual('childCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

// Virtual for courses
categorySchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'category',
});

// Method to update course count
categorySchema.methods.updateCourseCount = async function() {
  const Course = mongoose.model('Course');
  const courseCount = await Course.countDocuments({ 
    category: this._id,
    status: 'approved',
    published: true 
  });
  this.meta.courseCount = courseCount;
  await this.save();
  return courseCount;
};

// Method to get all descendant categories (including nested)
categorySchema.methods.getDescendantCategories = async function() {
  const getChildrenRecursive = async (parentId) => {
    const children = await Category.find({ parentCategory: parentId, isActive: true });
    let allChildren = [...children];
    
    for (const child of children) {
      const grandchildren = await getChildrenRecursive(child._id);
      allChildren = [...allChildren, ...grandchildren];
    }
    
    return allChildren;
  };
  
  return await getChildrenRecursive(this._id);
};

// Pre-save middleware
categorySchema.pre('save', function(next) {
  // Ensure parent category is not the same as itself
  if (this.parentCategory && this.parentCategory.toString() === this._id.toString()) {
    next(new Error('Category cannot be its own parent'));
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
Category.createIndexes();

module.exports = Category;