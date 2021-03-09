export const sortData = (data, sort) => {
  if ((data !== undefined) & (data.length > 1)) {
    data.sort(
      sort.order === 'asc'
        ? (a, b) =>
          a[sort.property] > b[sort.property]
            ? 1
            : b[sort.property] > a[sort.property]
              ? -1
              : 0
        : (a, b) =>
          a[sort.property] < b[sort.property]
            ? 1
            : b[sort.property] < a[sort.property]
              ? -1
              : 0
    )
  }
  return data
}

export const removeEmptyFields = (data) => {
  let items = {}
  for (const key in data) {
    if (data[key] !== '') {
      items = { ...items, [key]: data[key] }
    }
  }
  return items
}
