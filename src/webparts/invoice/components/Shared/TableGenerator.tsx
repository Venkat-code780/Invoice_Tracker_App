// import * as React from 'react';
import  { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Search from './Search';



const customStyles = {
  rows: {
    style: {
      minHeight: '70px',
       cursor: 'pointer',
         transition: 'all 0.2s ease-in-out'   // override the row height
    },
        highlightOnHoverStyle: {
      backgroundColor: '#f1f1f1',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // 👈 shadow on hover
      transform: 'scale(1.005)', // optional subtle zoom
    },
  },
  headCells: {
    style: {
      paddingLeft: '11px', // override the cell padding for head cells
      // paddingRight: '3px',
      color: '#572ba7',
      fontSize: '.9rem',
      background: 'linear-gradient(rgb(228 228 228),rgb(191 191 191))',
      borderTop: '0!important',
      borderBottom: '2px solid #dee2e6;',
      verticalAlign: 'bottom',
        whiteSpace: 'normal', 
        overflow: 'visible',
         textOverflow: 'clip'

    },
  },
  cells: {
    style: {
      paddingLeft: '3px', // override the cell padding for data cells
      paddingRight: '3px',
      

    },
  },
};
interface TableGeneratorProps {
  columns: any;
  data: any;
  fileName: string;
  prvPageNumber?: number;
  prvSort?:any;
  prvDirection?:boolean;
  onChange?:any;
  onSortChange?:any;
  onSortDirection?:any;
  onRowClick?:any;
  
  
}

const TableGenerator = ({ columns, data, fileName, prvPageNumber,prvSort,prvDirection,onChange,onRowClick,onSortChange,onSortDirection }: TableGeneratorProps) => {
  //let lsMyrequests = localStorage.getItem('PrvData');
 // const tableData = { columns, data };
  const [totalData, setData] = useState([]);
  const [search, setSearchText] = useState('');
 //search= lsMyrequests != null? JSON.parse(localStorage.getItem('PrvData')).SearchKey:null
 prvPageNumber = prvPageNumber!= undefined && prvPageNumber!= null?prvPageNumber:1;
 prvSort = (prvSort!= undefined && prvSort!= null)?prvSort:"";
 prvDirection = (prvDirection!= undefined && prvDirection!= null)?prvDirection:false;
 // localStorage.setItem('PrvData',null);
  
  useEffect(() => {
    
    let totaldata = data;
    if (search) {
      var allKeys = Object.keys(data[0]);
      totaldata = totaldata.filter((l: { [x: string]: { toString: () => string; }; }) => allKeys.some(field => {
        return (l[field] && l[field].toString().toLowerCase().includes(search.toLowerCase()));
      }));
      setData(totaldata);
    } else {
      setData(data);
    }
  }, [data, search]);

  return (
    <div>

        <div className="col-6 text-right-col-6">
          <Search onSearch={value => {
            setSearchText(value);
          }} ></Search>
        </div>

       
    

      {/* <div>
        <ExportListItemsToPDF listName={fileName} columns={columns} data={data}></ExportListItemsToPDF>
      </div> */}

      <div className="mt-2" id="tablePDF">
        <DataTable
          noHeader
          columns={columns}
          data={totalData}
          striped={true}
          pagination
          actions
          customStyles={customStyles}
          paginationDefaultPage={1}
          persistTableHead={true}
          onChangePage={onChange}
          onSort={onSortChange}
          defaultSortFieldId={prvSort}
          defaultSortAsc={prvDirection}
          onRowClicked={onRowClick}
        />
        
      </div>
    </div>
  );
};

export default TableGenerator;
