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
  views,
  visitors
}`;

const emptyViewingsQuery = `*[_type == "pageViews" && slug == $slug].visitors[count(viewings[]) == 0]`;

export {
  submissionsQuery,
  unreadSubmissionsQuery,
  analyticsQuery,
  emptyViewingsQuery,
};
