// src/components/styledcomps/childDevelopment.tsx
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Baby } from 'lucide-react';
import { useChildren } from '@/hooks/useChildren'; 
import AgeGroupSection from './ageGroupSection';
import { ChildWithRelation } from '@/types';

interface Milestone {
  category: string;
  description: string;
  image: string | null;
}

interface AgeGroupData {
  ageGroup: string;
  milestones: Milestone[];
}

interface ChildDevelopmentDashboardProps {
  childId?: string | null;
}

/**
 * Calculate detailed age information from birth date
 */
// function calculateAge(birthDate: Date | string) {
//   const today = new Date();
//   const birth = new Date(birthDate);
 
//   const totalMonths = (today.getFullYear() - birth.getFullYear()) * 12 +
//                      (today.getMonth() - birth.getMonth());
 
//   // Calculate total days and weeks for more accurate calculations
//   const timeDiff = today.getTime() - birth.getTime();
//   const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
//   const totalWeeks = Math.floor(totalDays / 7);
 
//   const years = Math.floor(totalMonths / 12);
//   const months = totalMonths % 12;
 
//   let ageString = '';
//   if (totalMonths < 12) {
//     if (totalWeeks < 12) {
//       ageString = `${totalWeeks} week${totalWeeks !== 1 ? 's' : ''} old`;
//     } else {
//       ageString = `${totalMonths} month${totalMonths !== 1 ? 's' : ''} old`;
//     }
//   } else {
//     ageString = `${years} year${years !== 1 ? 's' : ''}`;
//     if (months > 0) {
//       ageString += ` ${months} month${months !== 1 ? 's' : ''}`;
//     }
//     ageString += ' old';
//   }
 
//   return { years, months, totalMonths, totalWeeks, totalDays, ageString };
// }

/**
 * Map calculated age to CSV age groups with precise matching
 * CSV Age Groups: Week 1, Week 2, Week 3, Week 4, Week 5-6, Week 7-8, Week 9-12, 
 *                 1-2 Months, 3 Months, 4 Months, 5 Months, 6 Months, 7-12 Months, 
 *                 1 Year, 18-24 Months, 2-3 Years, 3 Years
 */
function mapAgeToAgeGroup(birthDate: Date | string): string {
  const today = new Date();
  const birth = new Date(birthDate);
  
  // Calculate exact time difference
  const timeDiff = today.getTime() - birth.getTime();
  const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = (today.getFullYear() - birth.getFullYear()) * 12 +
                     (today.getMonth() - birth.getMonth());
  
  // Week-based stages (first ~3 months)
  if (totalDays <= 7) return 'Week 1';
  if (totalDays <= 14) return 'Week 2';
  if (totalDays <= 21) return 'Week 3';
  if (totalDays <= 28) return 'Week 4';
  if (totalWeeks <= 6) return 'Week 5-6';
  if (totalWeeks <= 8) return 'Week 7-8';
  if (totalWeeks <= 12) return 'Week 9-12';
  
  // Monthly stages - using more precise month calculations
  if (totalMonths <= 2) return '1-2 Months';
  if (totalMonths < 4) return '3 Months';
  if (totalMonths < 5) return '4 Months';
  if (totalMonths < 6) return '5 Months';
  if (totalMonths < 7) return '6 Months';
  if (totalMonths < 12) return '7-12 Months';
  
  // Year-based stages
  if (totalMonths < 18) return '1 Year';
  if (totalMonths < 24) return '18-24 Months';
  if (totalMonths < 36) return '2-3 Years';
  
  // For children 3+ years old
  return '3 Years';
}

/**
 * Get age groups that are relevant for the current child
 * This includes current age group plus 1-2 adjacent groups for context
 */
function getRelevantAgeGroups(currentAgeGroup: string, allAgeGroups: string[]): string[] {
  const ageGroupOrder = [
    'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5-6', 'Week 7-8', 'Week 9-12',
    '1-2 Months', '3 Months', '4 Months', '5 Months', '6 Months', '7-12 Months',
    '1 Year', '18-24 Months', '2-3 Years', '3 Years'
  ];
  
  const currentIndex = ageGroupOrder.indexOf(currentAgeGroup);
  if (currentIndex === -1) return [currentAgeGroup];
  
  // Include current age group and the next one (for upcoming milestones)
  const relevantIndices = [currentIndex];
  if (currentIndex + 1 < ageGroupOrder.length) {
    relevantIndices.push(currentIndex + 1);
  }
  
  // Filter to only include age groups that exist in the actual data
  return relevantIndices
    .map(index => ageGroupOrder[index])
    .filter(ageGroup => allAgeGroups.includes(ageGroup));
}

export default function ChildDevelopmentDashboard({ childId = null }: ChildDevelopmentDashboardProps) {
  const { children } = useChildren();
  const [developmentData, setDevelopmentData] = useState<AgeGroupData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChild, setCurrentChild] = useState<ChildWithRelation | null>(null);

  // Find the current child from the children array
  useEffect(() => {
    if (childId && children.length > 0) {
      const child = children.find(c => c.id === childId);
      setCurrentChild(child || null);
    } else if (children.length > 0) {
      // If no childId provided, use the first child
      setCurrentChild(children[0]);
    } else {
      setCurrentChild(null);
    }
  }, [childId, children]);
  
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        setLoading(true);
        
        // Read CSV file from the specified path
        const response = await fetch('/data/milestones_en.csv');
        if (!response.ok) {
          throw new Error('Failed to load CSV file');
        }
        
        const csvText = await response.text();
        
        // Parse CSV with Papa Parse
        const parseResult = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          delimitersToGuess: [',', '\t', '|', ';']
        });
        
        if (parseResult.errors.length > 0) {
          console.warn('CSV parsing warnings:', parseResult.errors);
        }
        
        const headers = parseResult.meta.fields || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = parseResult.data as Record<string, any>[];
        
        const parsedData: AgeGroupData[] = [];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows.forEach((row: Record<string, any>) => {
          const ageGroup = row['Age/Timeframe'];
          if (!ageGroup) return;
          
          const milestones: Milestone[] = [];
          
          // Process each header to find categories and their corresponding images
          headers.forEach(header => {
            // Skip the age column and empty headers
            if (header === 'Age/Timeframe' || !header || header.trim() === '') return;
            
            // Check if this is an image column (ends with "Images")
            if (header.endsWith(' Images')) return;
            
            const description = row[header];
            
            // Only add if description exists and is meaningful
            if (description && 
                description !== '-' && 
                description !== 'N/A' && 
                description.toString().trim() !== '') {
              
              // Look for corresponding image column
              const imageColumnName = header + ' Images';
              const imageUrl = row[imageColumnName];
              
              milestones.push({
                category: header,
                description: description.toString(),
                image: imageUrl && imageUrl !== '-' && imageUrl !== 'N/A' ? imageUrl : null
              });
            }
          });
          
          if (milestones.length > 0) {
            parsedData.push({
              ageGroup,
              milestones
            });
          }
        });
        
        setDevelopmentData(parsedData);
        setError(null);
      } catch (err) {
        console.error('Error loading CSV data:', err);
        setError('Failed to load milestone data. Please check if the CSV file exists at /data/milestones_en.csv');
      } finally {
        setLoading(false);
      }
    };
    
    loadCSVData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 pb-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading milestone data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-base-100 pb-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the current child's age group and calculate age details
  const currentChildAgeGroup = currentChild?.dateOfBirth 
    ? mapAgeToAgeGroup(currentChild.dateOfBirth)
    : null;
    
  // const ageDetails = currentChild?.dateOfBirth 
  //   ? calculateAge(currentChild.dateOfBirth)
  //   : null;
  
  // Get relevant age groups (current + next stage for context)
  const allAgeGroups = developmentData.map(item => item.ageGroup);
  const relevantAgeGroups = currentChildAgeGroup 
    ? getRelevantAgeGroups(currentChildAgeGroup, allAgeGroups)
    : [];
    
  // Filter data to show only relevant age groups
  const relevantData = developmentData.filter(item => 
    relevantAgeGroups.includes(item.ageGroup)
  );
  
  return (
    <div className="min-h-screen bg-base-100 pb-20 p-6"> 
      <div className="max-w-4xl mx-auto">
        {/* {currentChild && currentChildAgeGroup && ageDetails && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-4 bg-indigo-100 rounded-2xl">
              <div className="p-3 bg-indigo-600 rounded-full">
                <Baby className="text-white" size={24} />
              </div>
              <div className="text-left">
                <p className="text-sm text-indigo-600 font-medium">
                  {currentChild.name} is {ageDetails.ageString}
                </p>
                <p className="text-lg font-bold text-indigo-800">
                  Current Stage: {currentChildAgeGroup}
                </p>
              </div>
            </div>
          </div>
        )} */}
        
        <div className="space-y-8">
          {currentChild && relevantData.length > 0 ? (
            relevantData.map((ageData, index) => (
              <AgeGroupSection
                key={`${ageData.ageGroup}-${index}`}
                ageGroup={ageData.ageGroup}
                milestones={ageData.milestones}
              />
            ))
          ) : currentChild ? (
            <div className="text-center py-12">
              <div className="p-6 bg-yellow-50 rounded-xl max-w-md mx-auto">
                <div className="text-yellow-600 mb-3">
                  <Baby size={32} className="mx-auto" />
                </div>
                <p className="text-yellow-700 font-medium mb-2">No milestones available</p>
                <p className="text-yellow-600 text-sm">
                  No milestones found for {currentChild.name}s current age group ({currentChildAgeGroup}).
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-6 bg-gray-50 rounded-xl max-w-md mx-auto">
                <div className="text-gray-400 mb-3">
                  <Baby size={32} className="mx-auto" />
                </div>
                <p className="text-gray-700 font-medium mb-2">No child selected</p>
                <p className="text-gray-600 text-sm">
                  Please select a child to view their development milestones.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div> 
  );
}