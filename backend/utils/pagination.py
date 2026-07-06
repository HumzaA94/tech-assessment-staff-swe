from sqlalchemy import func, select

from config import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from config import db


def parse_limit(raw_limit: str | None) -> int:
    """
    Parses a raw limit value and returns a sanitized integer within defined limits.

    This function processes a raw limit value, typically passed as a string, and ensures
    that it is converted into a valid integer within the specified range. If no value is
    provided or if the value cannot be converted to an integer, a default limit is returned.

    Parameters:
    raw_limit: str | None
        The raw limit value to parse. Can be a string representation of an integer
        or None if no limit is provided.

    Returns:
    int
        A sanitized integer representing the limit, constrained between predefined
        minimum and maximum values.
    """
    if not raw_limit:
        return DEFAULT_PAGE_SIZE
    try:
        limit = int(raw_limit)
    except ValueError:
        return DEFAULT_PAGE_SIZE
    return max(1, min(limit, MAX_PAGE_SIZE))


def parse_page(raw_page: str | None) -> int:
    """
    Parses a page number from a raw string input.

    This function takes a raw page number in the form of a string, validates it,
    and converts it into an integer. If the input is invalid or not provided, it
    defaults to returning the value 1. The result will always be a positive integer.

    Args:
        raw_page (str | None): The raw input string representing the page number.
            Can be None or an invalid string.

    Returns:
        int: The parsed page number, defaulting to 1 for invalid or missing input.
    """
    if not raw_page:
        return 1
    try:
        page = int(raw_page)
    except ValueError:
        return 1
    return max(1, page)


def paginate(query, page: int, limit: int) -> dict:
    """
    Paginate a database query result set into pages of specified size.

    This function divides the results of a database query into pages, enabling
    efficient fetching of smaller subsets of data. It calculates metadata such
    as the total number of records, the current page, the number of items per
    page, and the total number of pages based on the given limit. This is useful
    for implementing pagination in APIs or user interfaces.

    Args:
        query: The database query object to paginate.
        page (int): The current page number, starting from 1.
        limit (int): The maximum number of items to include on each page.

    Returns:
        dict: A dictionary containing the following keys:
            - total (int): The total number of records in the result.
            - page (int): The current page number.
            - limit (int): The maximum number of items per page.
            - total_pages (int): The total number of pages based on the limit.
            - count (int): The number of items on the current page.
            - items (list): The list of items for the current page.
    """
    total = query.count()
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()
    total_pages = (total + limit - 1) // limit if total > 0 else 0

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "count": len(items),
        "items": items,
    }


def paginate_select(stmt        , page: int, limit: int) -> dict:
    """
    Paginate a SQLAlchemy query by a specific page number and limit.

    This function performs query pagination on a given SQLAlchemy statement. It
    calculates the total number of rows in the query, retrieves a subset of rows
    based on the specified page and limit, and formats the result into a
    dictionary containing pagination metadata and the queried items.

    Arguments:
        stmt: The SQLAlchemy query statement to be paginated.
        page (int): The page number to retrieve, where the first page starts at 1.
        limit (int): The maximum number of items to include per page.

    Returns:
        dict: A dictionary containing the following pagination details:
            - total: The total number of rows fetched by the query.
            - page: The page number that was requested.
            - limit: The number of items requested per page.
            - total_pages: The total number of pages available.
            - count: The number of items included in the current page.
            - items: A list of dictionaries representing the rows in the current page.
    """
    total = db.session.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    offset = (page - 1) * limit
    rows = db.session.execute(stmt.offset(offset).limit(limit)).mappings().all()
    items = [dict(row) for row in rows]
    total_pages = (total + limit - 1) // limit if total > 0 else 0

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "count": len(items),
        "items": items,
    }
