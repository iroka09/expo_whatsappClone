import moment from "moment"



export function getPastTime(publishedAt) {
  const pastTime = moment(publishedAt);
  const now = moment();
  const seconds = now.diff(pastTime, 'seconds');
  const minutes = now.diff(pastTime, 'minutes');
  const hours = now.diff(pastTime, 'hours');
  const days = now.diff(pastTime, 'days');
  const weeks = now.diff(pastTime, 'weeks');
  const months = now.diff(pastTime, 'months');
  const years = now.diff(pastTime, 'years');
  let result = '';
  if (seconds < 60)
    result = `${seconds}s`;
  else if (minutes < 60)
    result = `${minutes}m`;
  else if (hours < 24)
    result = `${hours}h`;
  else if (days < 7)
    result = `${days}d`;
  else if (weeks < 4)
    result = `${weeks}wk`;
  else if (months < 12)
    result = `${months}M`;
  else
    result = `${years}y`;
  return result
}