class APIFeatures {
  constructor(query, queryString, excludeFields = []) {
    this.query = query;
    this.queryString = queryString;
    this.excludeFields = ['select', 'sort', 'page', 'limit', ...excludeFields];
  }
}

filter() {
// copy the request query
    const reqQuery = {...this.queryString};

    // remove the fields that are not for filtering
    this.excludeFields.forEach(param => delete reqQuery[param]);

    // create the query string

    let queryStr = JSON.stringify(reqQuery);

    // create operators (mongoose operators)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|ne)\b/g, match=> `$${match}`);

    // applying filter to query
    this.query=this.query.find(JSON.parse(queryStr));

    return this;
}
   
sort(){
    if (this.queryString.sort){
        const sortBy = this.queryString.sort(',').join(' ');
        this.query = this.query.sort(sortBy);
    } else {
        // this is the default sort which is by creation date (newest first)
        this.query = this.query.sort('-createdAt')
    }

    return this;
}


