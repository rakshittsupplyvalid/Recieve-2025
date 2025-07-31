// types.ts
export interface ReimbursementListParams {
  ApprovalStatus: string;
  BillPaymentStatus?: string;
}

export interface DispatchRecieveParams {
  quantitymt: string;
}

export interface HealthReportDetailsRouteParams {
  reportId: string;

}

export interface SubmitTruckDataParams {
  truckData: string;
  date: any;
  grossWeight: any;
  bagCount: any;
  size: any;
  stainingColourPercent: any;
  BlackSmutPercent: any;
  sproutedPercent: any;
  spoiledPercent: any;
  onionSkinPercent: any;
  moisturePercent: any;
  SpoliedPercent: any;
  SpoliedComment: any;
  Branchpersonname: any;
  imageurl: any;
}

export interface HealthReportParams {
  truckNumber: string;
  grossWeight: string;
  netWeight: string;
  tareWeight: string;
  bagCount: string;
  size: string;
  selectedDate: Date;
}

export type RootStackParamList = {
  LoginApp: undefined;
  Drawernavigator: undefined;
  SelectFederation: undefined;
  Home: undefined;
  Login: undefined;
  Profile: undefined;
  List: undefined;
  RecieveDhasboard : undefined;
  WarehouseDrawernavigator: undefined;
  AssyingDrawernavigator: undefined;
  DispatchDrawernavigator: undefined;
  RecieveDrawernavigator: undefined;
   HealthReportList: undefined;
  HealthReportselect: undefined;
  ReimbursementForm: undefined;
  HealthReportlist: undefined;
  ReimbursementList: ReimbursementListParams;
  DispatchRecieve: DispatchRecieveParams;
  HealthReportDetails: HealthReportDetailsRouteParams;
  Dashboard: undefined;
  LanguageSelector: undefined;
  SubmitTruckData: SubmitTruckDataParams;
  ReportOffline: undefined;
  "Generate Health Report": undefined;
  "Health Report List": undefined;
  "Dispatch Report List": undefined;
  "Dispatch Truck List": undefined;
  "Receive Truck List": undefined;
  OfflineForm: undefined;
  HealthReport: HealthReportParams;
};
  