import * as React from 'react';


const AccessDenied: React.FC = () => {
  return (
   <div style={{padding: '35px 20px 15px 20px'}}>
    <div className="row">
        <div className="col-md-3 text-center">
            <div className="hand">
                <i className='fas fa-hand-paper'></i>
            </div>
        </div>
        <div className="col-md-9">
            <h2 style={{color:'#df5556'}}>Access Denied</h2>
            <p style={{ fontSize: '21px' }}>You don't have access to this page.</p>
            <p><a href="https://synergycomcom.sharepoint.com/sites/GDCTimesheet/DEV/SitePages/Timesheet.aspx">Click Here</a> to navigate to TimeSheet Page</p>
        </div>
    </div>
</div>
    );

};

export default AccessDenied;
