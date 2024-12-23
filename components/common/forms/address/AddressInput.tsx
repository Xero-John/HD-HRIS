import React, {useEffect, useState} from "react";
import {Controller, useFormContext} from "react-hook-form";
import addressData from "./address.json";
import {Selection} from "./../FormFields";
import {SelectionItems} from "@/components/common/forms/types/SelectionProp";
import {Autocomplete, AutocompleteItem} from "@nextui-org/react";
import {FormLabel} from "@/components/ui/form";
import {upperCase} from "lodash";

const AddressInput: React.FC = () => {
    const {control, setValue, getValues} = useFormContext();
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

    const initialRegion = getValues("addr_region") ? String(getValues("addr_region")) : "";
    const initialProvince = getValues("addr_province") ? String(getValues("addr_province")) : "";
    const initialCity = getValues("addr_municipal") ? String(getValues("addr_municipal")) : "";
    const initialBarangay = getValues("addr_baranggay") ? String(getValues("addr_baranggay")) : "";

    // Load initial values from form
    useEffect(() => {
        // Load regions
        const filteredRegions = addressData.filter((addr) => addr.parent_code === 0);
        const regionItems = filteredRegions.map((region) => ({
            key: String(region.address_code), label: region.address_name,
        }));
        setRegions(regionItems);

        // Set initial region if it exists in the data
        if (initialRegion && regionItems.some((region) => region.key === initialRegion)) {
            setSelectedRegion(initialRegion);
        }

        // Load provinces based on the initial region
        if (initialRegion) {
            const filteredProvinces = addressData.filter((addr) => String(addr.parent_code) === initialRegion);
            const provinceItems = filteredProvinces.map((province) => ({
                key: String(province.address_code), label: province.address_name,
            }));
            setProvinces(provinceItems);

            if (initialProvince && provinceItems.some((province) => province.key === initialProvince)) {
                setSelectedProvince(initialProvince);
            }
        }

        // Load cities based on the initial province
        if (initialProvince) {
            const filteredCities = addressData.filter((addr) => String(addr.parent_code) === initialProvince);
            const cityItems = filteredCities.map((city) => ({
                key: String(city.address_code), label: city.address_name,
            }));
            setCities(cityItems);

            if (initialCity && cityItems.some((city) => city.key === initialCity)) {
                setSelectedCity(initialCity);
            }
        }

        // Load barangays based on the initial city
        if (initialCity) {
            const filteredBarangays = addressData.filter((addr) => String(addr.parent_code) === initialCity);
            const barangayItems = filteredBarangays.map((barangay) => ({
                key: String(barangay.address_code), label: barangay.address_name,
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
            const filteredProvinces = addressData.filter((addr) => String(addr.parent_code) === selectedRegion);
            const provinceItems = filteredProvinces.map((province) => ({
                key: String(province.address_code), label: province.address_name,
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
            const filteredCities = addressData.filter((addr) => String(addr.parent_code) === selectedProvince);
            const cityItems = filteredCities.map((city) => ({
                key: String(city.address_code), label: city.address_name,
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
            const filteredBarangays = addressData.filter((addr) => String(addr.parent_code) === selectedCity);
            const barangayItems = filteredBarangays.map((barangay) => ({
                key: String(barangay.address_code), label: barangay.address_name,
            }));
            setBarangays(barangayItems);
            setSelectedBarangay(undefined);
        }
    }, [selectedCity]);

    return (<>
        {/* Region Selection */}
        <Controller
            control={control}
            name="addr_region"
            defaultValue={selectedRegion}
            render={({field}) => (<Autocomplete
                {...field}
                name="addr_region"
                disableSelectorIconRotation
                defaultItems={regions}
                label={<FormLabel>
                    Region
                    <span className="text-destructive text-medium"> *</span>
                </FormLabel>}
                labelPlacement="outside"
                placeholder="Select Region"
                aria-label="Region"
                color="primary"
                variant="bordered"
                radius="sm"
                onSelectionChange={(e) => {
                    const regionKey = String(e);
                    setSelectedRegion(regionKey);
                    setValue("addr_province", regionKey);
                    field.onChange(regionKey);
                    setValue("addr_province", "", {shouldValidate: true});
                    setValue("addr_municipal", "", {shouldValidate: true});
                    setValue("addr_baranggay", "", {shouldValidate: true});
                }}
            >
                {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
            </Autocomplete>)}
        />

        {/* Province Selection */}
        <Controller
            control={control}
            name="addr_province"
            defaultValue={selectedProvince}
            render={({field}) => (
                <Autocomplete
                    {...field}
                    disableSelectorIconRotation
                    defaultItems={provinces}
                    label={<FormLabel>
                        Province
                        <span className="text-destructive text-medium"> *</span>
                    </FormLabel>}
                    labelPlacement="outside"
                    placeholder="Select Province"
                    // items={provinces}
                    isDisabled={provinces.length === 0}
                    color="primary"
                    variant="bordered"
                    radius="sm"
                    onSelectionChange={(e) => {
                        const provinceKey = String(e);
                        setSelectedProvince(provinceKey);
                        setValue("addr_province", provinceKey);
                        field.onChange(provinceKey);
                        setValue("addr_municipal", "", {shouldValidate: true});
                        setValue("addr_baranggay", "", {shouldValidate: true});
                    }}
                >
                    {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                </Autocomplete>

                // <Autocomplete
                //     name="addr_region"
                //     disableSelectorIconRotation
                //     defaultItems={provinces}
                //     label={<FormLabel>
                //         Region
                //         <span className="text-destructive text-medium"> *</span>
                //     </FormLabel>}
                //     labelPlacement="outside"
                //     placeholder="Select Region"
                //     aria-label="Region"
                //     color="primary"
                //     variant="bordered"
                //     radius="sm"
                //     onSelectionChange={(e) => {
                //         const regionKey = String(e);
                //         setSelectedRegion(regionKey);
                //         setValue("addr_province", regionKey);
                //         field.onChange(regionKey);
                //         setValue("addr_province", "", {shouldValidate: true});
                //         setValue("addr_municipal", "", {shouldValidate: true});
                //         setValue("addr_baranggay", "", {shouldValidate: true});
                //     }}
                // >
                //     {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                // </Autocomplete>
            )}
        />

        {/* City/Municipality Selection */}
        <Controller
            control={control}
            name="addr_municipal"
            defaultValue={selectedCity}
            render={({field}) => (<Autocomplete
                    {...field}
                    disableSelectorIconRotation
                    defaultItems={cities}
                    label={<FormLabel>
                        City/Municipality
                        <span className="text-destructive text-medium"> *</span>
                    </FormLabel>}
                    labelPlacement="outside"
                    placeholder="Select City/Municipality"
                    // items={cities}
                    isDisabled={cities.length === 0}
                    color="primary"
                    variant="bordered"
                    radius="sm"
                    onSelectionChange={(e) => {
                        const cityKey = String(e);
                        setSelectedCity(cityKey);
                        setValue("addr_municipal", cityKey);
                        field.onChange(cityKey);
                        setValue('addr_baranggay', '', {shouldValidate: true});
                    }}
                >
                    {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                </Autocomplete>
                // <Selection
                //     placeholder="Select City/Municipality"
                //     name="addr_municipal"
                //     label="City/Municipality"
                //     items={cities}
                //     isDisabled={cities.length === 0}
                //     isRequired={true}
                //     selectedKeys={selectedCity ? [selectedCity] : undefined}
                //     onSelectionChange={(e) => {
                //         const cityKey = e.currentKey as string;
                //         setSelectedCity(cityKey);
                //         setValue("addr_municipal", cityKey);
                //         field.onChange(cityKey);
                //         setValue('addr_baranggay', '', {shouldValidate: true});
                //     }}
                // />
            )}
        />

        {/* Barangay Selection */}
        <Controller
            control={control}
            name="addr_baranggay"
            defaultValue={selectedBarangay}
            render={({field}) => (
                <Autocomplete
                    {...field}
                    name="addr_baranggay"
                    disableSelectorIconRotation
                    defaultItems={barangays.map((item) => ({key: item.key, label: upperCase(item.label)}))}
                    label={<FormLabel>
                        Barangay
                        <span className="text-destructive text-medium"> *</span>
                    </FormLabel>}
                    labelPlacement="outside"
                    placeholder="Select Barangay"
                    // items={barangays}
                    isDisabled={barangays.length === 0}
                    color="primary"
                    variant="bordered"
                    radius="sm"
                    onSelectionChange={(e) => {
                        const barangayKey = String(e);
                        setSelectedBarangay(barangayKey);
                        setValue("addr_baranggay", barangayKey);
                        field.onChange(barangayKey);
                    }}
                >
                    {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
                </Autocomplete>
            //     <Selection
            //     placeholder="Select Barangay"
            //     name="addr_baranggay"
            //     label="Barangay"
            //     items={barangays}
            //     isDisabled={barangays.length === 0}
            //     isRequired={true}
            //     selectedKeys={selectedBarangay ? [selectedBarangay] : undefined}
            //     onSelectionChange={(e) => {
            //         const barangayKey = e.currentKey as string;
            //         setSelectedBarangay(barangayKey);
            //         setValue("addr_baranggay", barangayKey);
            //         field.onChange(barangayKey);
            //     }}
            // />
        )}
        />
    </>);
};

export default AddressInput;
