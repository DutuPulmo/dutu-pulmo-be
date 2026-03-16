import { AppointmentTypeEnum } from '@/modules/common/enums/appointment-type.enum';

export enum AppointmentTypeFilterEnum {
  ALL = 'all',
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export function mapAppointmentTypeFilterToSlotType(
  filter?: AppointmentTypeFilterEnum,
): AppointmentTypeEnum | undefined {
  switch (filter) {
    case AppointmentTypeFilterEnum.ONLINE:
      return AppointmentTypeEnum.VIDEO;
    case AppointmentTypeFilterEnum.OFFLINE:
      return AppointmentTypeEnum.IN_CLINIC;
    default:
      return undefined;
  }
}
