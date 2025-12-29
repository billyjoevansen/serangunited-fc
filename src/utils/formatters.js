// Format tanggal ke bahasa Indonesia
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "-"
  
  const defaultOptions = {
    day: "numeric",
    month: "long",
    year:  "numeric",
    ... options
  }
  
  return new Date(dateString).toLocaleDateString("id-ID", defaultOptions)
}

// Format tanggal dengan waktu
export const formatDateTime = (dateString) => {
  if (!dateString) return "-"
  
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year:  "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

// Get score color class
export const getScoreColorClass = (score) => {
  if (score >= 75) return "text-green-600"
  if (score >= 50) return "text-yellow-600"
  return "text-red-600"
}

// Get score background class
export const getScoreBgClass = (score) => {
  if (score >= 75) return "bg-green-100 text-green-600"
  if (score >= 50) return "bg-yellow-100 text-yellow-600"
  return "bg-red-100 text-red-600"
}

// Get status badge class
export const getStatusBadgeClass = (status, nilai) => {
  if (nilai === 0 || ! nilai) return "bg-gray-100 text-gray-600"
  if (status === "LOLOS") return "bg-green-100 text-green-800"
  return "bg-red-100 text-red-800"
}