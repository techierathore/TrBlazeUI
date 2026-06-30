using System.Globalization;

namespace TrBlazeUI.Demo.Services;

/// <summary>
/// Service for generating mock data for demos.
/// </summary>
public class MockDataService
{
    private static readonly Random objRandom = new();

    private static readonly string[] objFirstNames = {
        "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
        "William", "Barbara", "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
        "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
        "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
        "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
        "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
        "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
        "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
        "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
        "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
        "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra"
    };

    private static readonly string[] objLastNames = {
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
        "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
        "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
        "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
        "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
        "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
        "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
        "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
        "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
        "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza"
    };

    private static readonly string[] objRoles = {
        "Admin", "User", "Guest", "Moderator", "Manager", "Developer", "Designer", "Analyst"
    };

    private static readonly string[] objStatuses = {
        "Active", "Inactive", "Pending", "Suspended"
    };

    private static readonly string[] objDepartments = {
        "Engineering", "Sales", "Marketing", "Support", "HR", "Finance", "Operations", "Product"
    };

    /// <summary>
    /// Generates a list of mock person records.
    /// </summary>
    /// <param name="count">Number of records to generate.</param>
    /// <returns>List of person records with randomized data.</returns>
    public static List<Person> GeneratePersons(int count)
    {
        var persons = new List<Person>();
        for (var i = 0; i < count; i++)
        {
            persons.Add(new Person
            {
                Id = i + 1,
                Name = GenerateFullName(),
                Email = GenerateEmail(),
                Age = objRandom.Next(18, 70),
                Role = objRoles[objRandom.Next(objRoles.Length)],
                Status = objStatuses[objRandom.Next(objStatuses.Length)],
                Department = objDepartments[objRandom.Next(objDepartments.Length)],
                LastPromotionDate = GeneratePromotionDate(),
                Salary = objRandom.Next(40000, 150000),
                JoinDate = DateTime.Now.AddDays(-objRandom.Next(1, 3650)), // Random date within last 10 years
                IsActive = objRandom.Next(100) > 20 // 80% chance of being active
            });
        }
        return persons;
    }

    private static string GenerateFullName()
    {
        var firstName = objFirstNames[objRandom.Next(objFirstNames.Length)];
        var lastName = objLastNames[objRandom.Next(objLastNames.Length)];
        return $"{firstName} {lastName}";
    }

    private static string GenerateEmail()
    {
        var firstName = objFirstNames[objRandom.Next(objFirstNames.Length)].ToLower(CultureInfo.InvariantCulture);
        var lastName = objLastNames[objRandom.Next(objLastNames.Length)].ToLower(CultureInfo.InvariantCulture);
        var domain = objRandom.Next(5) switch
        {
            0 => "example.com",
            1 => "company.com",
            2 => "business.org",
            3 => "enterprise.net",
            _ => "organization.com"
        };
        var suffix = objRandom.Next(100) > 70 ? objRandom.Next(1, 999).ToString(CultureInfo.InvariantCulture) : "";
        return $"{firstName}.{lastName}{suffix}@{domain}";
    }

    private static DateTimeOffset? GeneratePromotionDate() =>
        DateTimeOffset.UtcNow - TimeSpan.FromDays(objRandom.Next(365, 730));
}

/// <summary>
/// Represents a person with various properties for demo purposes.
/// </summary>
public class Person
{
    /// <summary>
    /// Gets or sets the unique identifier for the person.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the full name of the person.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the email address of the person.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the age of the person, in years.
    /// </summary>
    public int Age { get; set; }

    /// <summary>
    /// Gets or sets the role assigned to the person.
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the current status of the person (for example, Active or Inactive).
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the department the person belongs to.
    /// </summary>
    public string Department { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date of the person's most recent promotion, or <c>null</c> if none.
    /// </summary>
    public DateTimeOffset? LastPromotionDate { get; set; }

    /// <summary>
    /// Gets or sets the annual salary of the person.
    /// </summary>
    public int Salary { get; set; }

    /// <summary>
    /// Gets or sets the date the person joined.
    /// </summary>
    public DateTime JoinDate { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the person is currently active.
    /// </summary>
    public bool IsActive { get; set; }
}
