import React from 'react';
import { StyleSheet, Text, View, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Hero Section */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80' }} 
          style={styles.heroBackground}
        >
          <View style={styles.overlay}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Bridging Dreams</Text>
              <Text style={styles.heroTitleAccent}>To Reality</Text>
              <Text style={styles.heroSubtitle}>
                Premier construction services delivering exceptional quality and innovative solutions.
              </Text>
              
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.ctaButtonText}>GET A FREE CONSULTATION</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <Text style={styles.sectionSubtitle}>Comprehensive construction solutions</Text>
          
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>🏗️</Text>
              <Text style={styles.cardTitle}>Commercial</Text>
              <Text style={styles.cardDesc}>Office buildings & retail spaces.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>🏠</Text>
              <Text style={styles.cardTitle}>Residential</Text>
              <Text style={styles.cardDesc}>Custom homes & renovations.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>🏭</Text>
              <Text style={styles.cardTitle}>Industrial</Text>
              <Text style={styles.cardDesc}>Warehouses & factories.</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>📐</Text>
              <Text style={styles.cardTitle}>Design & Build</Text>
              <Text style={styles.cardDesc}>Integrated construction services.</Text>
            </View>
          </View>
        </View>

        {/* Featured Projects Section */}
        <View style={styles.projectsSection}>
          <Text style={styles.sectionTitle}>Featured Projects</Text>
          
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80' }} 
            style={styles.projectImage}
            imageStyle={{ borderRadius: 8 }}
          >
            <View style={styles.projectOverlay}>
              <Text style={styles.projectTitle}>Downtown Office Tower</Text>
              <Text style={styles.projectDesc}>Commercial • 50,000 sq ft</Text>
            </View>
          </ImageBackground>

          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80' }} 
            style={styles.projectImage}
            imageStyle={{ borderRadius: 8 }}
          >
            <View style={styles.projectOverlay}>
              <Text style={styles.projectTitle}>Luxury Residential Complex</Text>
              <Text style={styles.projectDesc}>Residential • 120 Units</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>JAJR Construction</Text>
          <Text style={styles.footerText}>123 Construction Ave, San Fernando</Text>
          <Text style={styles.footerText}>info@jajrconstruction.com</Text>
          <Text style={styles.footerCopyright}>© 2026 JAJR Construction.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // gray-900
  },
  heroBackground: {
    width: '100%',
    height: 500,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  heroContent: {
    maxWidth: 400,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  heroTitleAccent: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#eab308', // yellow-500
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 30,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#eab308', // yellow-500
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
  },
  servicesSection: {
    padding: 20,
    backgroundColor: '#111827',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#1f2937', // gray-800
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
    color: '#9ca3af',
  },
  projectsSection: {
    padding: 20,
    backgroundColor: '#1f2937', // gray-800
  },
  projectImage: {
    height: 200,
    marginBottom: 15,
    justifyContent: 'flex-end',
  },
  projectOverlay: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    padding: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  projectDesc: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 5,
  },
  footer: {
    padding: 30,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eab308',
    marginBottom: 10,
  },
  footerText: {
    color: '#9ca3af',
    marginBottom: 5,
  },
  footerCopyright: {
    color: '#6b7280',
    marginTop: 15,
    fontSize: 12,
  }
});
