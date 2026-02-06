import * as React from 'react';
import { sp } from '@pnp/sp/presets/all';
import TableGenerator from '../Shared/TableGenerator';
import DateUtilities from '../Utilities/Dateutilities';
import { useNavigate } from 'react-router-dom';

const NewDashboard = () => {
    const [proposals, setProposals] = React.useState<any[]>([]);
    const [poItems, setPoItems] = React.useState<any[]>([]);
    const [activeTab, setActiveTab] = React.useState<'PO' | 'INVOICE'>('PO');

    const navigate = useNavigate();

    React.useEffect(() => {
        fetchProposals();
        fetchPoItems();
    }, []);

    const fetchProposals = async () => {
        try {
            const res = await sp.web.lists
                .getByTitle("ProposalDetails")
                .items
                .select(
                    "Id",
                    "Title",
                    "ProposalFor",
                    "ClientName",
                    "SubmittedDate",
                    "Amount",
                    "Status",
                    "Created",
                    "SubmittedBy/Id",
                    "SubmittedBy/Title",
                    "IsProposalTagged"
                )
                .expand("SubmittedBy")
                .filter("IsProposalTagged eq 0 and Status eq 'Approved'")
                .orderBy("Id", false)
                .top(5000)
                .get();

            setProposals(res);
        } catch (err) {
            console.error("Error fetching proposals", err);
        }
    };

    const fetchPoItems = async () => {
        try {
            const res = await sp.web.lists
                .getByTitle("PODetails")
                .items
                .select("Id", "ProposalFor", "ClientName", "ProjectTitle", "PONumber", "POType", "POValue", "Created", "Author/Title", "Author/Id")
                .expand("Author")
                .filter("IsPOInvoiceTagged eq 0")
                .orderBy("Id", false)
                .top(5000)
                .get();

            setPoItems(res);
        } catch (err) {
            console.error("Error fetching PO items", err);
        }
    };

    const proposalColumns = [
        { name: "Location", selector: (row: any) => row.ProposalFor, sortable: true },
        { name: "Client Name", selector: (row: any) => row.ClientName, sortable: true },
        { name: "Project Title", selector: (row: any) => row.Title, sortable: true },
        {
            name: "Submitted Date",
            selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.SubmittedDate),
            sortable: true,
        },
        {
            name: "Amount",
            selector: (row: any) => {
                const amount = parseFloat(row.Amount);
                if (isNaN(amount)) return "-";
                return new Intl.NumberFormat('en-US', { style: 'decimal' }).format(amount);
            },
            sortable: true,
        },
        { name: "Status", selector: (row: any) => row.Status, sortable: true },
        { name: "Created By", selector: (row: any) => row.SubmittedBy?.Title || "-", sortable: true },
        { name: "Created Date", selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.Created), sortable: true },
    ];

    const poColumns = [
        { name: "Location", selector: (row: any) => row.ProposalFor, sortable: true },
        { name: "Client Name", selector: (row: any) => row.ClientName, sortable: true },
        { name: "Project Title", selector: (row: any) => row.ProjectTitle, sortable: true },
        { name: "PO Number", selector: (row: any) => row.PONumber, sortable: true },
        { name: "PO Type", selector: (row: any) => row.POType, sortable: true },
        {
            name: "PO Value",
            selector: (row: any) => {
                const amount = parseFloat(row.POValue);
                if (isNaN(amount)) return "-";
                return new Intl.NumberFormat('en-US', { style: 'decimal' }).format(amount);
            },
            sortable: true,
        },
        { name: "Created By", selector: (row: any) => row.Author?.Title || "", sortable: true },
        { name: "Created Date", selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.Created), sortable: true },
    ];

    // ✨ NEW: separate click handlers
    // const handlePoRowClick = (row: any) => {
    //     navigate(`/PO/${row.Id}`);
    // };
  const handlePoRowClick = (row: any) => {
    navigate(`/PO?ProposalId=${row.Id}`);
  };




    const handleInvoiceRowClick = (row: any) => {
        navigate(`/Invoice/${row.Id}`);
    };

    return (
        <div>
            <div className="tab-header">
                <button className={activeTab === 'PO' ? 'active-tab' : ''} onClick={() => setActiveTab('PO')}>
                    Pending for PO
                </button>

                <button className={activeTab === 'INVOICE' ? 'active-tab' : ''} onClick={() => setActiveTab('INVOICE')}>
                    Pending for Invoice
                </button>
            </div>

            <div className="border-box-shadow light-box table-responsive dataTables_wrapper-overflow right-search-table py-2">
                <div className="tab-content">
                    {activeTab === 'PO' && (
                        <TableGenerator
                            columns={proposalColumns}
                            data={proposals}
                            fileName="PendingForPO"
                            onRowClick={handlePoRowClick}
                        />
                    )}

                    {activeTab === 'INVOICE' && (
                        <TableGenerator
                            columns={poColumns}
                            data={poItems}
                            fileName="PendingForInvoice"
                            onRowClick={handleInvoiceRowClick}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewDashboard;
