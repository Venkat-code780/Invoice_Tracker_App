import * as React from 'react';
import { useState, useEffect } from 'react';
import { PrimaryButton, DefaultButton, TextField, Dropdown} from '@fluentui/react';
import { sp } from '@pnp/sp/presets/all';
//import styles from '../Invoice.module.scss';

const Clients = () => {
    const [clients, setClients] = useState<{ Id: number; ClientName: string; Location: string; ReminderSLA: string; SalesPerson: string; AlternateSalesPerson: string }[]>([]);
    const [locations, setLocations] = useState<{ key: string; text: string }[]>([]);
    const [form, setForm] = useState({
      ClientName: '',
      Location: '',
      ReminderSLA: '',
      SalesPerson: '',
      AlternateSalesPerson: ''
    });
  
    useEffect(() => {
      sp.web.lists.getByTitle("Clients").items.get().then(setClients);
      sp.web.lists.getByTitle("Locations").items.select("Title").get().then(data => {
        setLocations(data.map(loc => ({ key: loc.Title, text: loc.Title })));
      });
    }, []);
  
    const handleChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      const target = event.target as HTMLInputElement;
      setForm({ ...form, [target.name]: newValue || '' });
    };
  
    const  handleDropdownChange = (value: string) => {
      setForm({ ...form, Location: value });
    };

    const handleSubmit = async () => {
      await sp.web.lists.getByTitle("Clients").items.add(form);
      const newClient = { ...form, Id: clients.length > 0 ? clients[clients.length - 1].Id + 1 : 1 };
      setClients([...clients, newClient]);
      setForm({ ClientName: '', Location: '', ReminderSLA: '', SalesPerson: '', AlternateSalesPerson: '' });
    };
  
    return (
           <div>
          <Dropdown label="Location" className="Location" options={locations} onChange={(_e, option) => handleDropdownChange(option?.text ?? '')} required /><h2>Clients</h2><div >
            <TextField label="Client Name" name="ClientName" value={form.ClientName} onChange={handleChange} required />
            <Dropdown label="Location" options={locations} onChange={(_e, option) => handleDropdownChange(option?.text ?? '')} required />
            <TextField label="Reminder SLA" name="ReminderSLA" value={form.ReminderSLA} onChange={handleChange} required />
            <TextField label="Sales Person(s)" name="SalesPerson" value={form.SalesPerson} onChange={handleChange} required />
            <TextField label="Alternate Sales Person(s)" name="AlternateSalesPerson" value={form.AlternateSalesPerson} onChange={handleChange} />
            <div>
                <PrimaryButton text="Submit" onClick={handleSubmit} />
                <DefaultButton text="Cancel" />
            </div>
        </div><table>
                <thead>
                    <tr>
                        <th>Edit</th>
                        <th>Company Name</th>
                        <th>Location</th>
                        <th>Reminder SLA (#)</th>
                        <th>Sales Person(s)</th>
                        <th>Alternate Sales Person(s)</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.Id}>
                            <td><a href={`#edit-${client.Id}`}>Edit</a></td>
                            <td>{client.ClientName}</td>
                            <td>{client.Location}</td>
                            <td>{client.ReminderSLA}</td>
                            <td>{client.SalesPerson}</td>
                            <td>{client.AlternateSalesPerson}</td>
                        </tr>
                    ))}
                </tbody>
            </table></div>
    );
  };
  
  export default Clients;
  