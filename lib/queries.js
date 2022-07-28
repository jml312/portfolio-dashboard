const submissionsQuery = `*[_type == "submissions"]{
  _id,
  name,
  email,
  message,
  date,
  isRead,
} | order(isRead asc, date desc)`;

const unreadSubmissionsQuery = `*[_type == "submissions" && !isRead] {
  _id,
  name,
  email,
  message,
  date,
  isRead,
} | order(date desc)`;

const analyticsQuery = `*[_type == "pageViews"] {
  page,
  slug,
  visitors
}`;

export { submissionsQuery, unreadSubmissionsQuery, analyticsQuery };
