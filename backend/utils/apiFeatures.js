class APIFeatures {
  constructor(query, queryString, excludeFields = []) {
    this.query = query;
    this.queryString = queryString;
    this.excludeFields = ['select', 'sort', 'page', 'limit', ...excludeFields];
  }

  filter() {
    // copy the request query
    const reqQuery = { ...this.queryString };

    // remove the fields that are not for filtering
    this.excludeFields.forEach((param) => delete reqQuery[param]);

    // create the query string

    let queryStr = JSON.stringify(reqQuery);

    // create operators (mongoose operators)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in|ne)\b/g,
      (match) => `$${match}`
    );

    // applying filter to query
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // this is the default sort which is by creation date (newest first)
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields(defaultExclude = []) {
    if (this.queryString.select) {
      const fields = this.queryString.select.split(',').join(' ');

      // handle excluded fields (eg. password)
      if (defaultExclude.length > 0) {
        const excludeStr = defaultExclude.map((field) => `-${field}`).join(' ');
        // Only exclude if not explicitly requested
        const explicitlyRequested = defaultExclude.some((field) =>
          this.queryString.select.split(',').includes(field)
        );

        if (!explicitlyRequested) {
          this.query = this.query.select(`${fields} ${excludeStr}`);
        } else {
          this.query = this.query.select(fields);
        }
      } else {
        this.query = this.query.select(fields);
      }
    } else if (defaultExclude.length > 0) {
      // apply default exclusions when no specific selection
      const excludeStr = defaultExclude.map((field) => `-${field}`).join(' ');
      this.query = this.query.select(excludeStr);
    }

    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Apply pagination
    this.query = this.query.skip(startIndex).limit(limit);

    // Store pagination info for later use
    this.paginationInfo = {
      page,
      limit,
      startIndex,
      endIndex,
    };

    return this;
  }

  // Helper method to get final results with metadata
  async getResults() {
    // Get total count before executing the main query
    const totalQuery = this.query.model.find(this.query.getFilter());
    const total = await totalQuery.countDocuments();

    // Execute the main query
    const results = await this.query;

    if (this.paginationInfo) {
      const { page, limit, startIndex, endIndex } = this.paginationInfo;

      // Calculate pagination links
      const pagination = {};

      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }

      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }

      return {
        success: true,
        count: results.length,
        total,
        page,
        limit,
        pagination: Object.keys(pagination).length > 0 ? pagination : undefined,
        data: results,
      };
    }

    return {
      success: true,
      count: results.length,
      data: results,
    };
  }
}

module.exports = APIFeatures;
