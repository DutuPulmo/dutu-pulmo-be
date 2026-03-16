import { Injectable } from '@nestjs/common';

export interface ConsultationPricingResult {
  baseFee: number;
  discountPercent: number;
  finalFee: number;
}

@Injectable()
export class ConsultationPricingService {
  resolveBaseFee(
    scheduleFee: string | number | null | undefined,
    doctorDefaultFee: string | number | null | undefined,
  ): number {
    const scheduleAmount = this.toNonNegativeNumber(scheduleFee);
    if (scheduleAmount > 0) {
      return scheduleAmount;
    }

    return this.toNonNegativeNumber(doctorDefaultFee);
  }

  calculateFinalFee(
    baseFeeInput: string | number | null | undefined,
    discountPercentInput: number | null | undefined,
  ): ConsultationPricingResult {
    const baseFee = this.toNonNegativeNumber(baseFeeInput);
    const discountPercent = this.normalizeDiscount(discountPercentInput);
    const discounted = baseFee * ((100 - discountPercent) / 100);

    return {
      baseFee,
      discountPercent,
      // NOTE: Consultation fee is represented as whole VND.
      // Do not reuse this for refund/negative amount calculations.
      finalFee: Math.floor(discounted),
    };
  }

  toVndString(amount: number): string {
    return String(Math.max(0, Math.floor(amount)));
  }

  private toNonNegativeNumber(
    value: string | number | null | undefined,
  ): number {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return 0;
    return num;
  }

  private normalizeDiscount(value: number | null | undefined): number {
    if (value === null || value === undefined) return 0;
    if (Number.isNaN(value)) return 0;
    if (value < 0) return 0;
    if (value > 100) return 100;
    return value;
  }
}
