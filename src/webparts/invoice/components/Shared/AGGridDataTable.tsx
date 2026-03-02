/*
 * ---------------------------------------------------------------------------------------------------------
 * Ag-Grid Community License Information
 * ---------------------------------------------------------------------------------------------------------
 * This web part uses Ag-Grid Community (version 34.3.1), which is licensed under
 * the MIT License.
 *
 * | Property                | Details                                                                     |
 * |-------------------------|------------------------------------------------------------------------     |
 * | License Type            | MIT License                                                                 |
 * | Use                     | Free for personal and commercial projects                                   |
 * | Redistribution          | Must include the MIT License and copyright notice if redistributing         |
 * | License Details         | https://opensource.org/licenses/MIT                                         |
 * | Commercial License      | Required for Ag-Grid Enterprise (Paid version)                              |
 * | Enterprise License Info | https://www.ag-grid.com/                                                    |
 *
 * Note: If you upgrade to Ag-Grid Enterprise, you will need to obtain a commercial license from Ag-Grid.
 * ---------------------------------------------------------------------------------------------------------
 */

import * as React from "react";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { themeBalham } from "ag-grid-community";
// import { themeMaterial } from 'ag-grid-community';
//  import { themeQuartz } from "ag-grid-community";
import { INoRowsOverlayParams } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

// import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../../CSS/AGGridDataTable.css";
import ResetIconFilter from "./AGGridCustomColumnFilter";
import CustomLoadingOverlay from "./CustomLoadingOverlay";

const NoRowsOverlay: React.FC<INoRowsOverlayParams> = () => {
  return (
    <div style={{ textAlign: "center", color: "#777", padding: "20px" }}>
      <FontAwesomeIcon
        className="no-recordfound-icon"
        icon={faBoxOpen}
        size="3x"
        style={{ marginBottom: 8 }}
      />
      <div color="#000">No records to display</div>
    </div>
  );
};

const AGGridDataTable = (props: any) => {
  const gridRef = useRef<any>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  const rowData = props.data || [];
  const columnDefs = props.columns || [];

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 120,
      // floatingFilter: true,
      filter: ResetIconFilter,
      unSortIcon: true,
      filterParams: {
        filterOptions: ["contains"],
        defaultOption: "contains",
        maxNumConditions: 1,
        buttons: ['reset'], // Adds an "Apply" and a "Reset" button
      closeOnApply: true, // Optional: Closes the filter popup after "Apply" or "Reset" is clicked
    
        
        // debounceMs: 200,
        // original behavior – working
        textFormatter: (val: any) => {
          if (val == null) return "";
          return String(val).toLowerCase();
        },
        filterPlaceholder: "Search here...",
      },
      sortable: true,
      resizable: true,
      wrapText: true,
      autoHeight: true,
      wrapHeaderText: true, // allows header text to wrap
      autoHeaderHeight: true, // automatically adjusts header row height
      headerTooltipValueGetter: (params: any) => {
        return params.colDef.headerName;
      },
    }),
    []
  );

  const overridenColumns = useMemo(() => {
  return columnDefs.map((col:any) => {
    // If the column has any filter, replace it with your custom ResetIconFilter
    if (col.filter) {
      return { ...col, filter: ResetIconFilter,getQuickFilterText: col.getQuickFilterText };
    }
    return col;
  });
}, [columnDefs]);

  const [quickFilter, setQuickFilter] = useState<string>("");

  // 🔥 Working quick filter function from old code
  const applyQuickFilter = (api: any, text: string) => {
    if (!api) return;

    if (typeof api.setQuickFilter === "function") {
      api.setQuickFilter(text);
      updateOverlay(api);
      return;
    }

    if (typeof api.setGridOption === "function") {
      try {
        api.setGridOption("quickFilterText", text);
        if (typeof api.onFilterChanged === "function") api.onFilterChanged();
      } catch {}
      updateOverlay(api);
      return;
    }

    if (api.gridOptions) {
      api.gridOptions.quickFilterText = text;
      try {
        if (typeof api.onFilterChanged === "function") api.onFilterChanged();
      } catch {}
      updateOverlay(api);
      return;
    }
    updateOverlay(api);
  };

  //  use the below to enamble dynamic column name in place holder for search in thecolumn filter
  // const columnDefsWithPlaceholders = useMemo(() =>
  //   columnDefs.map((col:any) => ({
  //     ...col,
  //     filterParams: {
  //       ...col.filterParams,
  //       filterPlaceholder: `Search in ${col.headerName || ""}...`
  //     }
  //   })),
  //   [columnDefs] // dependencies: recalc only if columnDefs changes
  // );

  // 🔥 When grid is ready, capture API & apply search
  const onGridReady = (params: any) => {
    setGridApi(params.api);

    // optional but safe
    if (quickFilter) applyQuickFilter(params.api, quickFilter);
  };

  // --> NEW HOOK: Handle internal column filter changes <--
  // This function ensures the overlay updates when users use the built-in column filters
  const handleModelUpdated = useCallback(() => {
    // We update the overlay whenever the grid's data model changes (filtering, sorting, etc.)
    updateOverlay(gridApi);
  }, [gridApi]);

  // 🔥 Sync quick filter to grid (this is what makes search work!)
  useEffect(() => {
    if (!gridApi) return;
    applyQuickFilter(gridApi, quickFilter);
  }, [quickFilter, gridApi]);

  const exportCsv = () => {
    if (props.onExportCsv) return props.onExportCsv();
    gridRef.current?.api?.exportDataAsCsv?.({ fileName: "export.csv" });
  };

  // const updateOverlay = (api: any) => {
  //   if (!api) return;

  //   const rowCount = api.getDisplayedRowCount();

  //   if (rowCount === 0) {
  //     api.showNoRowsOverlay();
  //   } else {
  //     api.hideOverlay();
  //   }
  // };

  const updateOverlay = (api: any) => {
  if (!api) return;

  // 🔑 IMPORTANT: clear loading overlay first
  // api.hideOverlay();
  api.setGridOption('loading', false);


  const rowCount = api.getDisplayedRowCount();

  if (rowCount === 0) {
    api.showNoRowsOverlay();
  }
};

const onPaginationChanged = useCallback(() => {
  if (!gridApi) return;

  // gridApi.showLoadingOverlay();
  gridApi.setGridOption('loading', true);


  setTimeout(() => {
    // gridApi.hideOverlay();
    gridApi.setGridOption('loading', false);
    updateOverlay(gridApi); 
  }, 50);
}, [gridApi]);

//  use for row selection
// const rowSelection = useMemo(() => { 
// 	return {
//         mode: 'singleRow'
//     };
// }, []);


  return (
    <>
      {props.showAddButton && <div className="col-12">
        {props.navigateOnBtnClick ? (
          <NavLink
            title={props.btnTitle}
            className="csrLink ms-draggable"
            to={props.navigateOnBtnClick}
          >
            <button
              type="button"
              className="SubmitButtons btn NewButton me-1"
              id={"" + (props.btnSpanID || "")}
            >
              <span className="position-static">
                <FontAwesomeIcon icon={faPlus} /> {props.btnCaption}
              </span>
            </button>
          </NavLink>
        ) : (
          <button
            type="button"
            className="SubmitButtons btn NewButton me-1"
            id={"" + (props.btnSpanID || "")}
            onClick={() => props.addNew?.()}
          >
            <span className="position-static">
              <FontAwesomeIcon icon={faPlus} /> {props.btnCaption}
            </span>
          </button>
        )}
      </div>}
      <div className="table-responsive dataTables_wrapper-overflow">
        <div className="form-border-box p-2 mx-1 my-2">
          <div className="row py-2">
            <div className="col-12 pe-0 text-end me-1">
              {props.showAddButton && (
                <div
                  style={{ paddingLeft: "0.5rem" }}
                  className={props.customBtnClass}
                  id={"" + (props.btnDivID || "")}
                ></div>
              )}
            </div>

            {props.searchBoxLeft && (
              <div className="col-12 ps-0 agGrid-Quick-Filter-Wrapper">
                <input
                  type="text"
                  className="agGrid-Quick-Filter"
                  placeholder="Search"
                  value={quickFilter}
                  onChange={(e) => setQuickFilter(e.target.value)}
                  style={{ float: "right" }}
                />
                {/* <button onClick={()=>setQuickFilter('')}> */}
                 {quickFilter && <span className="quickfilter-clear-button" onClick={()=>setQuickFilter('')}>
                  <FontAwesomeIcon icon={faX} /> 
                </span> }
                {/* </button> */}

                {props.showExportExcel && (
                  <button onClick={exportCsv} className="btn">
                    Export CSV
                  </button>
                )}

                {props.showMultiApproveOrReject && (
                  <>
                    <button
                      type="button"
                      id="btnApprove"
                      name="Approve"
                      onClick={props.onClickApproveOrReject}
                      className="SubmitButtons btn"
                      title="Approve"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      id="btnReject"
                      name="Reject"
                      onClick={props.onClickApproveOrReject}
                      className="RejectButtons btn"
                      title="Reject"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}

            {!props.searchBoxLeft && (
              <div
                className="col d-flex justify-content-end agGrid-Quick-Filter-Wrapper"
                style={{ gap: 8 }}
              >
                <input
                  type="text"
                  className="agGrid-Quick-Filter"
                  placeholder="Search"
                  value={quickFilter}
                  onChange={(e) => setQuickFilter(e.target.value)}
                  style={{ float: "right" }}
                />

                {props.showExportExcel && (
                  <button onClick={exportCsv} className="btn">
                    Export CSV
                  </button>
                )}

                {props.showMultiApproveOrReject && (
                  <>
                    <button
                      type="button"
                      id="btnApprove"
                      name="Approve"
                      onClick={props.onClickApproveOrReject}
                      className="SubmitButtons btn"
                      title="Approve"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      id="btnReject"
                      name="Reject"
                      onClick={props.onClickApproveOrReject}
                      className="RejectButtons btn"
                      title="Reject"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div
            className="ag-theme-alpine"
            style={{ width: "100%", height: 400 }}
          >
            <AgGridReact
              theme={themeBalham}
              rowHeight={42}
              ref={gridRef}
              rowData={rowData}
              columnDefs={overridenColumns}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={props.paginationPageSize || 10}
              // rowSelection={props.rowSelection || rowSelection}
              onRowClicked={props.onRowClicked || (() => {})}
              paginationPageSizeSelector={[10, 25, 50, 100]}
              onGridReady={onGridReady}
              domLayout={props.domLayout || "normal"}
              onModelUpdated={handleModelUpdated}
              // suppressColumnVirtualization={true}     // REQUIRED
              // ensureDomOrder={true} // REQUIRED
              suppressHorizontalScroll={props.suppressHorizontalScroll}
              // suppressSizeToFit={true}
              // suppressColumnHiding={true}
              suppressAutoSize={props.suppressHorizontalScroll || false}
              suppressColumnMoveAnimation={
                props.suppressColumnMoveAnimation || true
              }
              suppressMovableColumns={props.suppressHorizontalScroll || true}
              suppressColumnVirtualisation={true}
              animateRows={true}
              // overlayNoRowsTemplate=

              // {`<span style="padding: 10px; color: gray; font-size: 14px;">No records to display</span>`}
              noRowsOverlayComponent={NoRowsOverlay}
              loadingOverlayComponent={CustomLoadingOverlay}
              tooltipShowDelay={0}
              onPaginationChanged={onPaginationChanged}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AGGridDataTable;
