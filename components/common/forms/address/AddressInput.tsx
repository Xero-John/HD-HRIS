import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import addressData from './address.json';
import { Selection } from './../FormFields';
import { SelectionItems } from '@/components/common/forms/types/SelectionProp';

const AddressInput: React.FC = () => {
    const { control, setValue, getValues } = useFormContext();
    const [regions, setRegions] = useState<SelectionItems[]>([]);
    const [provinces, setProvinces] = useState<SelectionItems[]>([]);
    const [cities, setCities] = useState<SelectionItems[]>([]);
    const [barangays, setBarangays] = useState<SelectionItems[]>([]);

    const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
    const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);
    const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
    const [selectedBarangay, setSelectedBarangay] = useState<string | undefined>(undefined);
    // const initialRegion = getValues('region') ? String(getValues('region')) : undefined;
    // const initialProvince = getValues('province') ? String(getValues('province')) : undefined;
    // const initialCity = getValues('city') ? String(getValues('city')) : undefined;
    // const initialBarangay = getValues('barangay') ? String(getValues('barangay')) : undefined;

    const initialRegion = getValues('region') ? String(getValues('region')) : '';
    const initialProvince = getValues('province') ? String(getValues('province')) : '';
    const initialCity = getValues('city') ? String(getValues('city')) : '';
    const initialBarangay = getValues('barangay') ? String(getValues('barangay')) : '';


    // Load initial values from form
    useEffect(() => {
        // Load regions
        const filteredRegions = addressData.filter((addr) => addr.parent_code === 0);
        const regionItems = filteredRegions.map((region) => ({
            key: String(region.address_code),
            label: region.address_name,
        }));
        setRegions(regionItems);

        // Set initial region if it exists in the data
        if (initialRegion && regionItems.some((region) => region.key === initialRegion)) {
            setSelectedRegion(initialRegion);
        }

        // Load provinces based on the initial region
        if (initialRegion) {
            const filteredProvinces = addressData.filter(
                (addr) => String(addr.parent_code) === initialRegion
            );
            const provinceItems = filteredProvinces.map((province) => ({
                key: String(province.address_code),
                label: province.address_name,
            }));
            setProvinces(provinceItems);

            if (initialProvince && provinceItems.some((province) => province.key === initialProvince)) {
                setSelectedProvince(initialProvince);
            }
        }

        // Load cities based on the initial province
        if (initialProvince) {
            const filteredCities = addressData.filter(
                (addr) => String(addr.parent_code) === initialProvince
            );
            const cityItems = filteredCities.map((city) => ({
                key: String(city.address_code),
                label: city.address_name,
            }));
            setCities(cityItems);

            if (initialCity && cityItems.some((city) => city.key === initialCity)) {
                setSelectedCity(initialCity);
            }
        }

        // Load barangays based on the initial city
        if (initialCity) {
            const filteredBarangays = addressData.filter(
                (addr) => String(addr.parent_code) === initialCity
            );
            const barangayItems = filteredBarangays.map((barangay) => ({
                key: String(barangay.address_code),
                label: barangay.address_name,
            }));
            setBarangays(barangayItems);

            if (initialBarangay && barangayItems.some((barangay) => barangay.key === initialBarangay)) {
                setSelectedBarangay(initialBarangay);
            }
        }
    }, [getValues, initialBarangay, initialCity, initialProvince, initialRegion]);

    // Update provinces when selectedRegion changes
    useEffect(() => {
        if (selectedRegion) {
            const filteredProvinces = addressData.filter(
                (addr) => String(addr.parent_code) === selectedRegion
            );
            const provinceItems = filteredProvinces.map((province) => ({
                key: String(province.address_code),
                label: province.address_name,
            }));
            setProvinces(provinceItems);
            setSelectedProvince(undefined);
            setCities([]); // Reset cities
            setBarangays([]); // Reset barangays
            setSelectedCity(undefined);
            setSelectedBarangay(undefined);
        }
    }, [selectedRegion]);

    // Update cities when selectedProvince changes
    useEffect(() => {
        if (selectedProvince) {
            const filteredCities = addressData.filter(
                (addr) => String(addr.parent_code) === selectedProvince
            );
            const cityItems = filteredCities.map((city) => ({
                key: String(city.address_code),
                label: city.address_name,
            }));
            setCities(cityItems);
            setSelectedCity(undefined);
            setBarangays([]); // Reset barangays
            setSelectedBarangay(undefined);
        }
    }, [selectedProvince]);

    // Update barangays when selectedCity changes
    useEffect(() => {
        if (selectedCity) {
            const filteredBarangays = addressData.filter(
                (addr) => String(addr.parent_code) === selectedCity
            );
            const barangayItems = filteredBarangays.map((barangay) => ({
                key: String(barangay.address_code),
                label: barangay.address_name,
            }));
            setBarangays(barangayItems);
            setSelectedBarangay(undefined);
        }
    }, [selectedCity]);

    return (
        <>
            {/* Region Selection */}
            <Controller
                control={control}
                name="region"
                defaultValue={selectedRegion}
                render={({ field }) => (
                    <Selection
                        placeholder="Select Region"
                        name="region"
                        label="Region"
                        items={regions}
                        isRequired={true}
                        selectedKeys={selectedRegion ? [selectedRegion] : undefined}
                        onSelectionChange={(e) => {
                            const regionKey = e.currentKey as string;
                            setSelectedRegion(regionKey);
                            setValue('region', regionKey);
                            field.onChange(regionKey);
                        }}
                    />
                )}
            />

            {/* Province Selection */}
            <Controller
                control={control}
                name="province"
                defaultValue={selectedProvince}
                render={({ field }) => (
                    <Selection
                        placeholder="Select Province"
                        name="province"
                        label="Province"
                        items={provinces}
                        // isDisabled={provinces.length === 0}
                        isRequired={true}
                        selectedKeys={selectedProvince ? [selectedProvince] : undefined}
                        onSelectionChange={(e) => {
                            const provinceKey = e.currentKey as string;
                            setSelectedProvince(provinceKey);
                            setValue('province', provinceKey);
                            field.onChange(provinceKey);
                        }}
                    />
                )}
            />

            {/* City/Municipality Selection */}
            <Controller
                control={control}
                name="city"
                defaultValue={selectedCity}
                render={({ field }) => (
                    <Selection
                        placeholder="Select City/Municipality"
                        name="city"
                        label="City/Municipality"
                        items={cities}
                        // isDisabled={cities.length === 0}
                        isRequired={true}
                        selectedKeys={selectedCity ? [selectedCity] : undefined}
                        onSelectionChange={(e) => {
                            const cityKey = e.currentKey as string;
                            setSelectedCity(cityKey);
                            setValue('city', cityKey);
                            field.onChange(cityKey);
                        }}
                    />
                )}
            />

            {/* Barangay Selection */}
            <Controller
                control={control}
                name="barangay"
                defaultValue={selectedBarangay}
                render={({ field }) => (
                    <Selection
                        placeholder="Select Barangay"
                        name="barangay"
                        label="Barangay"
                        items={barangays}
                        // isDisabled={barangays.length === 0}
                        isRequired={true}
                        selectedKeys={selectedBarangay ? [selectedBarangay] : undefined}
                        onSelectionChange={(e) => {
                            const barangayKey = e.currentKey as string;
                            setSelectedBarangay(barangayKey);
                            setValue('barangay', barangayKey);
                            field.onChange(barangayKey);
                        }}
                    />
                )}
            />
        </>
    );
};

export default AddressInput;
