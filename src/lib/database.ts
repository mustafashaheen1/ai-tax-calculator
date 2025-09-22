// Database utilities - Firebase only
export const safeDbOperation = async (operation: () => Promise<any>) => {
  try {
    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    throw error
  }
}