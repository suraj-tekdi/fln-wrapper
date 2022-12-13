import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { components } from 'types/schema';
import { SwayamApiResponse } from 'types/SwayamApiResponse';
import { swayamCatalogueGenerator } from 'utils/generator';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getCoursesFromSwayam(body: {
    context: components['schemas']['Context'];
    message: { intent: components['schemas']['Intent'] };
  }) {
    const intent: components['schemas']['Intent'] = body.message.intent;
    console.log('intent: ', intent);

    // destructuring the intent
    const provider = intent?.provider?.descriptor?.name;
    const query = intent?.item?.descriptor?.name;
    const courseMode = intent?.item?.tags?.course_mode;
    const courseDuration = intent?.item?.tags?.course_duration;
    const courseCredits = intent?.item?.tags?.course_credits;
    const courseCategory = intent?.item?.tags?.course_category;
    const rating = intent?.item?.rating;

    // const courseType = intent.item.tags.course_type;
    // const course_level = intent.item.tags.course_level;
    // const courseLanguage = intent.item.tags.course_language;
    // const coursePrice = intent.item.tags.course_price;

    const gql = `{
      courseList(
        args: {
          includeClosed: false
          filterText: ${query ? '"' + query + '"' : '""'}
          category: ${courseCategory ? '"' + courseCategory + '"' : '""'}
          status: "Upcoming"
          tags: ""
          duration: ${courseDuration ? '"' + courseDuration + '"' : '"all"'}
          examDate: "all"
          credits: ${courseCredits === 'N'
        ? '"false"'
        : courseCredits === 'Y'
          ? '"true"'
          : '"all"'
      }
          ncCode: ${provider ? '"' + provider + '"' : '"all"'}
          courseType: ${courseMode ? '"' + courseMode + '"' : '"all"'}
        }
        first: 1058
      ) {
        edges {
          node {
            id
            title
            url
            explorerSummary
            explorerInstructorName
            enrollment {
              enrolled
            }
            openForRegistration
            showInExplorer
            startDate
            endDate
            examDate
            enrollmentEndDate
            estimatedWorkload
            category {
              name
              category
              parentId
            }
            tags {
              name
            }
            featured
            coursePictureUrl
            credits
            weeks
            nodeCode
            instructorInstitute
            ncCode
            semester
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      examDates {
        date
      }
    }
    `;
    console.log('gql', gql);
    try {
      const resp = await lastValueFrom(
        this.httpService
          .get('https://swayam.gov.in/modules/gql/query', {
            params: {
              q: gql,
              expanded_gcb_tags: 'gcb-markdown',
            },
          })
          .pipe(map((item) => item.data)),
      );

      const swayamResponse: SwayamApiResponse = JSON.parse(resp.substr(4));
      // console.log('returned courses are: ', swayamResponse);
      const catalog = swayamCatalogueGenerator(swayamResponse, query);

      const courseData: any = {
        context: body.context,
        message: catalog,
      };

      return courseData;
    } catch (err) {
      console.log('err: ', err);
      throw new InternalServerErrorException(err);
    }
  }
}
