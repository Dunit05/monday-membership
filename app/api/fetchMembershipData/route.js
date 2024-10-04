import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { employeeId } = await req.json();
    console.log('Employee ID received:', employeeId);

    if (!employeeId) {
      console.error('Employee ID is missing');
      return NextResponse.json(
        { message: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const apiToken =
      'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQxOTE0OTc1MSwiYWFpIjoxMSwidWlkIjo0MjcwNzExMiwiaWFkIjoiMjAyNC0xMC0wM1QxNzoyNDozNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTY3MTUyNTIsInJnbiI6InVzZTEifQ.478E6G-HFGn61vK-HR-Fnkb1f0xdSHtSVTR2rnQNqME'; // Replace with your actual API token

    // GraphQL query to fetch membership data from Monday.com
    const query =
      '{ boards (ids:7561441884) { name id description items_page { items { name column_values { id type text } } } } }';

    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from Monday.com API:', errorText);
      return NextResponse.json(
        { message: 'Error fetching data from Monday.com' },
        { status: 500 }
      );
    }

    const { data } = await response.json();
    const items = data.boards[0].items_page.items;

    const foundItem = items.find((item) =>
      item.column_values.some(
        (col) => col.id === 'text__1' && col.text === employeeId
      )
    );

    if (!foundItem) {
      console.log('No matching employee found');
      return NextResponse.json(
        { message: 'Employee not found' },
        { status: 404 }
      );
    }

    const renewalDateColumn = foundItem.column_values.find(
      (col) => col.id === 'text8__1'
    );
    const renewalDate = renewalDateColumn ? renewalDateColumn.text : 'N/A';

    const today = new Date();
    const renewalDateObj = new Date(renewalDate);
    const timeDiff = renewalDateObj.getTime() - today.getTime();
    const daysToRenewal = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const membershipStatus =
      daysToRenewal <= 0
        ? 'Your Membership is up for Renewal.'
        : 'Your membership is Active.';

    return NextResponse.json({
      name: foundItem.name,
      renewalDate,
      daysToRenewal,
      membershipStatus,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
