// pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FarmerProfile, FarmProfile, Language, LandUnit, SoilType } from '../types';
import { getCurrentLocation } from '../services/locationService';

// Reusable Form Input Component
const FormInput: React.FC<{label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string;}> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input id={id} name={id} {...props} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 shadow-sm p-2" />
    </div>
);

// Farmer Profile Component
const FarmerProfileEditor: React.FC<{t: any; profile: FarmerProfile; onSave: (p: FarmerProfile) => void;}> = ({ t, profile, onSave }) => {
    const [editData, setEditData] = useState(profile);
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setEditData(p => ({...p, photo: event.target?.result as string}));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
                <img src={editData.photo || `https://ui-avatars.com/api/?name=${editData.name}&background=random`} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                <label htmlFor="photo-upload" className="cursor-pointer text-sm text-indigo-600 dark:text-indigo-400 hover:underline">{t.form_change_photo}</label>
            </div>
            <FormInput label={t.form_name} id="name" value={editData.name} onChange={e => setEditData(p => ({...p, name: e.target.value}))} required />
            <FormInput label={t.form_phone} id="phone" value={editData.phone || ''} onChange={e => setEditData(p => ({...p, phone: e.target.value}))} type="tel" />
            <FormInput label={t.form_village} id="village" value={editData.village || ''} onChange={e => setEditData(p => ({...p, village: e.target.value}))} />
            <FormInput label={t.form_district} id="district" value={editData.district || ''} onChange={e => setEditData(p => ({...p, district: e.target.value}))} />
            <FormInput label={t.form_state} id="state" value={editData.state || ''} onChange={e => setEditData(p => ({...p, state: e.target.value}))} />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">{t.save}</button>
        </form>
    );
};

// Farm Profile Form Modal
const FarmProfileForm: React.FC<{t: any; farm: FarmProfile | null; onSave: (f: FarmProfile) => void; onClose: () => void; onDelete: (id: string) => void}> = ({t, farm, onSave, onClose, onDelete}) => {
    const [formData, setFormData] = useState<FarmProfile>(farm || {id: uuidv4(), name: '', location: null, size: {value: 1, unit: 'acres'}});
    
    const handleGetGPS = async () => {
        try {
            const loc = await getCurrentLocation();
            setFormData(f => ({ ...f, location: loc }));
        } catch (error) {
            alert((error as Error).message);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.name) return alert("Farm name is required.");
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-700">{farm ? t.profile_edit_farm : t.profile_add_farm}</h3>
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                    <FormInput label={t.form_farm_name} id="farmName" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} required />
                    <div>
                        <label className="block text-sm font-medium">{t.form_location}</label>
                        <div className="flex gap-2">
                           <input value={typeof formData.location === 'string' ? formData.location : (formData.location ? `${formData.location.lat.toFixed(4)}, ${formData.location.lon.toFixed(4)}` : '')} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 shadow-sm p-2" />
                           <button type="button" onClick={handleGetGPS} className="p-2 bg-blue-500 text-white rounded">📍</button>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t.form_land_size}</label>
                        <div className="flex gap-2">
                           <input type="number" value={formData.size.value} onChange={e => setFormData(f => ({...f, size: {...f.size, value: +e.target.value}}))} className="mt-1 block w-full rounded-md p-2 bg-gray-50 dark:bg-gray-600" />
                           <select value={formData.size.unit} onChange={e => setFormData(f => ({...f, size: {...f.size, unit: e.target.value as LandUnit}}))} className="mt-1 block w-full rounded-md p-2 bg-gray-50 dark:bg-gray-600">
                               <option value="acres">{t.form_unit_acres}</option>
                               <option value="guntas">{t.form_unit_guntas}</option>
                               <option value="hectares">{t.form_unit_hectares}</option>
                           </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t.form_soil_type}</label>
                         <select value={formData.soilType || ''} onChange={e => setFormData(f => ({...f, soilType: e.target.value as SoilType}))} className="mt-1 block w-full rounded-md p-2 bg-gray-50 dark:bg-gray-600">
                            <option value="">Select...</option>
                            <option value="Sandy">{t.form_soil_sandy}</option><option value="Loamy">{t.form_soil_loamy}</option><option value="Black">{t.form_soil_black}</option><option value="Red">{t.form_soil_red}</option><option value="Clay">{t.form_soil_clay}</option><option value="Other">{t.form_soil_other}</option>
                         </select>
                    </div>
                    <FormInput label={t.form_current_crop} id="currentCrop" value={formData.currentCrop || ''} onChange={e => setFormData(f => ({...f, currentCrop: e.target.value}))} />
                </form>
                 <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                    <div>
                        {farm && <button onClick={() => {onDelete(farm.id); onClose();}} className="text-red-600 hover:underline">{t.delete}</button>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">{t.cancel}</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded">{t.save}</button>
                    </div>
                 </div>
            </div>
        </div>
    );
};

// Main Profile Page
interface ProfilePageProps {
  t: any;
  farmerProfile: FarmerProfile | null;
  onSaveFarmer: (profile: FarmerProfile) => void;
  farmProfiles: FarmProfile[];
  onSaveFarm: (farm: FarmProfile) => void;
  onDeleteFarm: (farmId: string) => void;
}
const ProfilePage: React.FC<ProfilePageProps> = ({ t, farmerProfile, onSaveFarmer, farmProfiles, onSaveFarm, onDeleteFarm }) => {
    const [activeTab, setActiveTab] = useState('farmer');
    const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
    const [editingFarm, setEditingFarm] = useState<FarmProfile | null>(null);

    if (!farmerProfile) {
        return <div>Loading profile...</div>;
    }

    const openFarmModal = (farm: FarmProfile | null) => {
        setEditingFarm(farm);
        setIsFarmModalOpen(true);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 shadow-inner rounded-full p-1">
                <button onClick={() => setActiveTab('farmer')} className={`w-1/2 px-4 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'farmer' ? 'bg-white dark:bg-gray-900 text-indigo-600' : ''}`}>{t.profile_farmer_title}</button>
                <button onClick={() => setActiveTab('farm')} className={`w-1/2 px-4 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'farm' ? 'bg-white dark:bg-gray-900 text-indigo-600' : ''}`}>{t.profile_farm_title}</button>
            </div>

            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                {activeTab === 'farmer' ? (
                    <FarmerProfileEditor t={t} profile={farmerProfile} onSave={onSaveFarmer} />
                ) : (
                    <div className="space-y-3">
                        {farmProfiles.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t.profile_no_farms}</p>
                        ) : (
                            farmProfiles.map(farm => (
                                <div key={farm.id} onClick={() => openFarmModal(farm)} className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <h4 className="font-bold">{farm.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{farm.size.value} {farm.size.unit}</p>
                                </div>
                            ))
                        )}
                        <button onClick={() => openFarmModal(null)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">{t.profile_add_farm}</button>
                    </div>
                )}
            </div>
            
            {isFarmModalOpen && <FarmProfileForm t={t} farm={editingFarm} onSave={onSaveFarm} onClose={() => setIsFarmModalOpen(false)} onDelete={onDeleteFarm} />}
        </div>
    );
};

export default ProfilePage;
