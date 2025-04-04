import * as React from 'react';
import { useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, TextField, Modal, DetailsList, DetailsListLayoutMode, SelectionMode } from '@fluentui/react';
import { sp } from '@pnp/sp/presets/all';

const LocationsMasterPage = ({ context }: { context: any }) => {
    const [locations, setLocations] = useState<{ ID: number; Title: string }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ locationName: '' });

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
    

    const handleSubmit = async () => {
        await sp.web.lists.getByTitle('Location').items.add({
            Title: formData.locationName
        });
        setIsModalOpen(false);
        fetchLocations();
    };

    const columns = [
        { key: 'edit', name: 'Edit', fieldName: 'ID', minWidth: 50, isResizable: true, onRender: (item: any) => <PrimaryButton text="✏️" onClick={() => console.log('Edit', item)} /> },
        { key: 'Location', name: 'Location', fieldName: 'Title', minWidth: 100, isResizable: true }
    ];

    return (
        <div className='componentSection'>
            <h2>Location</h2>
            <PrimaryButton text="+ Add" onClick={() => setIsModalOpen(true)} />
            <DetailsList items={locations} columns={columns} layoutMode={DetailsListLayoutMode.fixedColumns} selectionMode={SelectionMode.none} />
            
            <Modal isOpen={isModalOpen} onDismiss={() => setIsModalOpen(false)}>
                <div>
                    <h3>Location Details</h3>
                    <TextField label="Location" name="locationName" required onChange={handleChange} />
                    <PrimaryButton text="Submit" onClick={handleSubmit} />
                    <DefaultButton text="Cancel" onClick={() => setIsModalOpen(false)} />
                </div>
            </Modal>
        </div>
    );
};

export default LocationsMasterPage;
