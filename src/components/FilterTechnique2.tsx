import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
const PRODUCTS = [
    { id: 1, name: "Apple", category: "Fruit", price: 2 },
    { id: 2, name: "Banana", category: "Fruit", price: 1 },
    { id: 3, name: "Carrot", category: "Vegetable", price: 3 },
    { id: 4, name: "Mango", category: "Fruit", price: 5 },
    { id: 5, name: "Broccoli", category: "Vegetable", price: 4 },
];
export const FilterTechnique2 = () => {

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sortType, setSortType] = useState('nameAsc');

    const processedData = useMemo(() => {

        let result = PRODUCTS;

        // 1️⃣ Filter by Name
        result = result.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );

        // 2️⃣ Filter by Category
        if (category !== 'All') {
            result = result.filter(item =>
                item.category === category
            );
        }

        // 3️⃣ Sorting
        switch (sortType) {
            case 'nameAsc':
                result = [...result].sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                break;

            case 'nameDesc':
                result = [...result].sort((a, b) =>
                    b.name.localeCompare(a.name)
                );
                break;

            case 'priceAsc':
                result = [...result].sort((a, b) =>
                    a.price - b.price
                );
                break;

            case 'priceDesc':
                result = [...result].sort((a, b) =>
                    b.price - a.price
                );
                break;

            default:
                break;
        }

        return result;

    }, [search, category, sortType]);

    return (
        <View style={{ padding: 20 }}>

            <TextInput
                placeholder="Search product..."
                value={search}
                onChangeText={setSearch}
                style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            />

            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Button title="All" onPress={() => setCategory('All')} />
                <Button title="Fruit" onPress={() => setCategory('Fruit')} />
                <Button title="Vegetable" onPress={() => setCategory('Vegetable')} />
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Button title="A-Z" onPress={() => setSortType('nameAsc')} />
                <Button title="Z-A" onPress={() => setSortType('nameDesc')} />
                <Button title="Price ↑" onPress={() => setSortType('priceAsc')} />
                <Button title="Price ↓" onPress={() => setSortType('priceDesc')} />
            </View>

            <FlatList
                data={processedData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Text style={{ padding: 10 }}>
                        {item.name} - {item.category} - ${item.price}
                    </Text>
                )}
            />

        </View>
    );
}