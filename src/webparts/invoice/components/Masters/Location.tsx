import * as React from 'react';
import { useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, TextField, Modal, DetailsList, DetailsListLayoutMode, SelectionMode } from '@fluentui/react';
import { sp } from '@pnp/sp/presets/all';

const LocationsMasterPage = ({ context }: { context: any }) => {
    const [locations, setLocations] = useState<{ ID: number; Title: string }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ locationName: '' });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editItemId, setEditItemId] = useState<number | null>(null);
    useEffect(() => {
        sp.setup({ spfxContext: context });
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        const items = await sp.web.lists.getByTitle('Location').items.get();
        setLocations(items);
    };

    const handleChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        const name = (event.target as HTMLInputElement).name; 
        setFormData({ ...formData, [name]: newValue || '' });
    };
    
   
  

    const openAddModal = () => {
        setFormData({ locationName: '' });
        setIsEditMode(false);
        setEditItemId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: { ID: number; Title: string }) => {
        setFormData({ locationName: item.Title });
        setIsEditMode(true);
        setEditItemId(item.ID);
        setIsModalOpen(true);
    };
    const handleSubmit = async () => {
        if (isEditMode && editItemId !== null) {
            // Update existing item
            await sp.web.lists.getByTitle('Location').items.getById(editItemId).update({
                Title: formData.locationName
            });
        } else {
            // Add new item
            await sp.web.lists.getByTitle('Location').items.add({
                Title: formData.locationName
            });
        }

        setIsModalOpen(false);
        fetchLocations();
    };  
       
     const columns = [
        {
            key: 'edit',
            name: 'Edit',
            fieldName: 'ID',
            minWidth: 50,
            isresizable: true,
            onRender: (item: any)=>(
                <PrimaryButton text='Edit'onClick={()=> openEditModal(item)} />
            )
        },
        {
            key: 'Location',
            name: 'Location',
            fieldName: 'Title',
            minWidth: 100,
            isresizable: true,
        }
     ];

    return (
        // <div className='componentSection'>
        //     <h2>Location</h2>
        //     <PrimaryButton text="+ Add" onClick={openAddModal} />
        //     <DetailsList items={locations} columns={columns} layoutMode={DetailsListLayoutMode.fixedColumns} selectionMode={SelectionMode.none} />
            
        //     <Modal isOpen={isModalOpen} onDismiss={() => setIsModalOpen(false)}>
        //         <div>
        //             <h3>Location Details</h3>
        //             <TextField label="Location" name="locationName" required onChange={handleChange} />
        //             <PrimaryButton text="Submit" onClick={handleSubmit} />
        //             <DefaultButton text="Cancel" onClick={() => setIsModalOpen(false)} />
        //         </div>
        //     </Modal>
        // </div>
        <div className='componentSection'>
        <h2>Location</h2>
        <PrimaryButton text="+ Add" onClick={openAddModal} />
        <DetailsList
            items={locations}
            columns={columns}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            selectionMode={SelectionMode.none}
        />

        <Modal isOpen={isModalOpen} onDismiss={() => setIsModalOpen(false)}>
            <div style={{ padding: 20 }}>
                <h3>{isEditMode ? 'Edit Location' : 'Add Location'}</h3>
                <TextField
                    label="Location"
                    name="locationName"
                    required
                    value={formData.locationName}
                    onChange={handleChange}
                />
                <PrimaryButton
                    text={isEditMode ? 'Update' : 'Submit'}
                    onClick={handleSubmit}
                    style={{ marginRight: 10 }}
                />
                <DefaultButton text="Cancel" onClick={() => setIsModalOpen(false)} />
            </div>
        </Modal>
    </div>
    );
};

export default LocationsMasterPage;
