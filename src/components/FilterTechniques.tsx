import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import React, { useMemo, useState } from 'react'
const PRODUCTS = [
    { id: 1, name: "Apple", category: "Fruit", price: 200 },
    { id: 2, name: "Banana", category: "Fruit", price: 100 },
    { id: 3, name: "Carrot", category: "Vegetable", price: 30 },
    { id: 4, name: "Broccoli", category: "Vegetable", price: 40 },
    { id: 5, name: "Mango", category: "Fruit", price: 503 },
];
const FilterTechniques = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const filteredData = useMemo(() => {
        return PRODUCTS
            // 🔎 Filter by Name
            .filter(item =>
                item.name.toLowerCase().includes(searchText.toLowerCase())
            )

            // 📦 Filter by Category
            .filter(item =>
                selectedCategory === 'All'
                    ? true
                    : item.category === selectedCategory
            )

            // 💰 Filter by Price
            .filter(item =>
                maxPrice ? item.price <= Number(maxPrice) : true
            )

            // 🔃 Sort by Price
            .sort((a, b) =>
                sortOrder === 'asc'
                    ? a.price - b.price
                    : b.price - a.price
            );

    }, [searchText, selectedCategory, maxPrice, sortOrder]);

    return (
        <View style={{ padding: 20 }}>

            {/* 🔎 Search by Name */}
            <TextInput
                placeholder="Search by name"
                value={searchText}
                onChangeText={setSearchText}
                style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            />

            {/* 📦 Filter by Category */}
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Button title="All" onPress={() => setSelectedCategory('All')} />
                <Button title="Fruit" onPress={() => setSelectedCategory('Fruit')} />
                <Button title="Vegetable" onPress={() => setSelectedCategory('Vegetable')} />
            </View>

            {/* 💰 Filter by Max Price */}
            <TextInput
                placeholder="Max price"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
            />

            {/* 🔃 Sort Buttons */}
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Button title="Price ↑" onPress={() => setSortOrder('asc')} />
                <Button title="Price ↓" onPress={() => setSortOrder('desc')} />
            </View>

            {/* 📋 List */}
            <FlatList
                data={filteredData}
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

export default FilterTechniques

const styles = StyleSheet.create({})