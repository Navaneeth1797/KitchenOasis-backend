class APIFilters {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  serach() {
    let keyword = this.queryString.keyword
      ? {
          name: {
            $regex: this.queryString.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }
  filters() {
    let queryStringRemove = { ...this.queryString };
    // fields to remove
    let fieldsRemove = ["keyword", "page"];
    fieldsRemove.forEach((ele) => delete queryStringRemove[ele]);
    // Fields to remove
    let queryString = JSON.stringify(queryStringRemove);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  pagination(resPerPage) {
    let currentPage = Number(this.queryString.page) || 1;
    let skip = resPerPage * (currentPage - 1);
    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

export default APIFilters;
