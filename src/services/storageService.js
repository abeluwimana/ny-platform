// LocalStorage service professional
const STORAGE_KEYS = {
  BOOKINGS: 'wedding_bookings',
  USERS: 'wedding_users',
  VIDEOS: 'wedding_videos',
};

class StorageService {
  // Get all bookings
  static getBookings() {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  }

  // Save booking
  static saveBooking(booking) {
    const bookings = this.getBookings();
    bookings.push(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    return booking;
  }

  // Update booking status
  static updateBookingStatus(id, status) {
    const bookings = this.getBookings();
    const updated = bookings.map(booking => 
      booking.id === id ? { ...booking, status, updatedAt: new Date().toISOString() } : booking
    );
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    return updated;
  }

  // Delete booking
  static deleteBooking(id) {
    const bookings = this.getBookings();
    const filtered = bookings.filter(booking => booking.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(filtered));
    return filtered;
  }

  // Get statistics
  static getStats() {
    const bookings = this.getBookings();
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      revenue: bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.price || 0), 0),
    };
  }
}

export default StorageService;