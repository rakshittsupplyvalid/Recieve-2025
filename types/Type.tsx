// types.ts
export type RootStackParamList = {
    LoginApp: undefined;
    Drawernavigator: undefined;
    SelectFederation: undefined;  // Add this type for SelectFederation screen
    Home: undefined;  // No params for Home screen
    Login: undefined;  // No params for Login screen
    Profile: undefined;  // No params for Profile screen
    List: undefined;  // No params for List screen
    WarehouseDrawernavigator: undefined;
    AssyingDrawernavigator: undefined;
    DispatchDrawernavigator: undefined;
    RecieveDrawernavigator: undefined;
    HealthReportselect: undefined;
    ReimbursementForm: undefined;
    ReimbursementList: { ApprovalStatus: string; BillPaymentStatus?: string };
    DispatchRecieve :  { quantitymt: string };
    Dashboard : undefined;
    LanguageSelector : undefined;
    SubmitTruckData:
     { truckData: string ,  
      date : any ,
      grossWeight: any, 
      bagCount : any, 
      size : any,
      stainingColourPercent : any ,
      BlackSmutPercent : any ,
      sproutedPercent : any ,
      spoiledPercent : any ,
      onionSkinPercent: any,
      moisturePercent : any,
      SpoliedPercent : any,
      SpoliedComment : any,
      Branchpersonname : any,
      imageurl : any,
      };
    ReportOffline :undefined;
    "Generate Health Report": undefined;
    "Health Report List": undefined;
    "Dispatch Report List": undefined;
    "Dispatch Truck List": undefined;
    "Receive Truck List": undefined;
    OfflineForm : undefined;
    HealthReport :  { 
      truckNumber: string;
  grossWeight: string;
  netWeight: string;
  tareWeight: string;
  bagCount: string;
  size: string;
  selectedDate: Date;
     };

  };
  