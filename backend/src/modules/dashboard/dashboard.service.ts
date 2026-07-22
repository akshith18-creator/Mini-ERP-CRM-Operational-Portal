import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  static async getDashboardStats() {
    return DashboardRepository.getSummaryStats();
  }
}
