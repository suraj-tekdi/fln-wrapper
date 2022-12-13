import { components } from 'types/schema';
import { SwayamApiResponse } from 'types/SwayamApiResponse';
import { SwayamCourse } from 'types/SwayamCourese';

export const swayamCatalogueGenerator = (
  apiData: SwayamApiResponse,
  query: string,
) => {
  const courses: ReadonlyArray<{ node: SwayamCourse }> =
    apiData.data.courseList.edges;
  const providerWise = {};
  const categories = new Set();

  courses.forEach((course) => {
    const item = course.node;
    const provider = item.ncCode;
    // creating the provider wise map
    if (providerWise[provider]) {
      providerWise[provider].push(item);
    } else {
      providerWise[provider] = [item];
    }

    // getting categories
    categories.add(item.category[0].name ? item.category[0].name : '');
  });

  const catalogue: components['schemas']['Catalog'] = {};
  catalogue['bpp/descriptor'] = { name: `Catalog for ${query}` };

  // adding providers
  catalogue['bpp/providers'] = Object.keys(providerWise).map(
    (provider: string) => {
      const providerObj: components['schemas']['Provider'] = {
        id: provider,
        descriptor: {
          name: provider,
        },
        categories: Array.from(categories),

        items: providerWise[provider].map((course: SwayamCourse) => {
          const providerItem: components['schemas']['Item'] = {
            id: course.id,
            parent_item_id: null,
            descriptor: {
              name: course.title,
              long_desc: course.explorerSummary,
            },
            price: {
              currency: 'INR',
              value: 0 + '', // map it to an actual response
            },
            category_id: course.category[0].name,
            recommended: course.featured ? true : false,
            time: {
              label: 'Course Schedule',
              duration: `P${course.weeks}W`, // ISO 8601 duration format
              range: {
                start: course.startDate.toString(),
                end: course.endDate.toString(),
              },
            },
            rating: '0', // map it to an actual response
            tags: {
              credits: course.credits + '',
              instructors: course.explorerInstructorName,
              offeringInstitue: course.instructorInstitute,
              url: course.url,
              thumbnail: course.coursePictureUrl,
              enrollmentEndDate: course.enrollmentEndDate.toString(),
            },
            rateable: true,
          };
          return providerItem;
        }),
      };
      return providerObj;
    },
  );

  return catalogue;
};
